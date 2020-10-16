const _ = require('lodash');
const { Signal, Order, History, SignalStatus, Sequelize } = require('@base/db');
const logger = require('@base/logger');
const config = require('@base/config');
const { eventbus } = require('./eventbus');

const ws = {
  sendSignal: null,
  sendSignals: null,
  sendSparkline: null
};

var priceCache = {
  // ticker: lastPrice
};

var signalsCache = {
  // ticker: [signal1, signal2, ...]
};

const SPARKLINE_LENGTH = 30;
const sparklineCache = {
  // ticker: { data, timestamp }
};

const saveHistory = async (message) => {
  if (config.storeHistory) {
    return History.createFromMessage(message);
  }
};

/**
 *
 * @param {String} ticker
 * @param {Number} price
 * @param {Number} timestamp
 */
const updateSparkline = function (ticker, price, timestamp) {
  let spark = sparklineCache[ticker];

  if (!spark) {
    sparklineCache[ticker] = { data: [], timestamp };
    spark = sparklineCache[ticker];
  }

  spark.timestamp = timestamp;

  if (spark.data.length === SPARKLINE_LENGTH) {
    spark.data.shift();
  }

  spark.data.push(parseFloat(price));

  logger.debug(`Sparkline updated for ticker ${ticker}, sparkline: ${JSON.stringify(spark)}`);

  ws.sendSparkline({ ticker, data: spark.data, timestamp: spark.timestamp });
};

/**
 *
 * @param {number} id
 * @param {Order[]} triggeredTP
 * @param {Order[]} triggeredSL
 */
const updateClosedAndRemaining = (signal, orders) => {
  const ordersToUpdate = [];

  if (!orders || signal.status !== SignalStatus.Active || !signal.remaining) return;

  for (const order of orders) {
    order.closed = true;

    if (signal.remaining - order.volume > 0) {
      order.closedVolume = order.volume;
      signal.remaining -= order.volume;
      signal.lastPrice = order.price;
      signal.profitability += order.closedVolume * order.price;

      ordersToUpdate.push(order);
    } else {
      order.closedVolume = signal.remaining;
      signal.status = SignalStatus.Finished;
      signal.remaining = 0;
      signal.lastPrice = order.price;
      signal.profitability += order.closedVolume * order.price;

      ordersToUpdate.push(order);
      break;
    }
  }

  return ordersToUpdate;
};

const between = (value, bottom, top) => {
  return (value >= bottom) && (value <= top);
};

const activateSignals = (ticker, price, lastPrice) => {
  const signalsToActivates = []; // { id: X, price: Y }

  const signals = signalsCache[ticker]; // Activate only signals whose ticker come in data frame

  if (!signals) {
    return signalsToActivates;
  }

  const priceMin = Math.min(price, lastPrice);
  const priceMax = Math.max(price, lastPrice);

  signals.forEach((signal) => {
    if (signal.status !== SignalStatus.Delayed) {
      return;
    }

    // For long entryPoints in reverse order by price: high -> low
    for (const entryPoint of signal.entryPoints) {
      logger.debug(`Checking entry point ${entryPoint.id} @ ${entryPoint.price} between ${priceMax} and ${priceMin}`);

      if (between(entryPoint.price, priceMin, priceMax)) {
        signal.status = SignalStatus.Active;
        signal.price = entryPoint.price;
        signal.lastPrice = entryPoint.price;
        signalsToActivates.push({ ...signal });
        logger.info(`Activating ${signal.type} signal ${signal.id} at price ${price} (entry point: ${entryPoint.price})`);
        break;
      }
    }
  });

  return signalsToActivates;
};

const handleDataFrame = async (message, serverWs) => {
  const signalsToSend = [];
  const ticker = message.s;
  const price = parseFloat(message.p);
  const timestamp = parseInt(message.T);

  logger.info(`------>>> Data frame handling begin for ticker ${ticker} @ ${price} at ${new Date()} (${new Date().getTime()}) <<<------`);

  // Do not await
  saveHistory(message);

  if (config.updateSparklines) {
    updateSparkline(ticker, price, timestamp);
  }

  const lastPrice = priceCache[ticker];
  priceCache[ticker] = price;

  if (!lastPrice) {
    logger.info(`No previous price for ticker ${ticker}, unable to determine price dynamic, skip data frame until next`);
    return;
  }

  const activatedSignals = activateSignals(ticker, price, lastPrice);
  if (activatedSignals && activatedSignals.length) {
    logger.info(`Got signal activation for: ${JSON.stringify(activatedSignals)}`);

    // Do not await here, not necessary for data preame processing, all required data already updated in-place
    Signal.activateMany(activatedSignals);

    signalsToSend.push(...activatedSignals.map(s => ({
      ...s,
      comment: `Signal activated at price ${s.price}`,
      commentLocalized: { key: 'preview.signal_activated', signalId: s.id, ticker, title: s.title, price: s.price }
    })));
  }

  const type = price > lastPrice ? 'long' : (price < lastPrice ? 'short' : '-');
  logger.verbose(`For ${ticker} dynamic changed to type ${type}`);

  const signalsToCheck = (signalsCache[ticker] || []).filter(signal => signal.status === SignalStatus.Active);

  const promises = [];

  signalsToCheck.forEach(signal => {
    let triggered;

    if ((signal.type === 'long' && type === 'long') || (signal.type === 'short' && type === 'short')) {
      logger.verbose(`signal.type=${signal.type}, type=${type}, choose to check take profits orders of signal ${signal.id}`);
      triggered = signal.takeProfitOrders;
    } else {
      logger.verbose(`signal.type=${signal.type}, type=${type}, choose to check stop loss orders of signal ${signal.id}`);
      triggered = signal.stopLossOrders;
    }

    triggered = (type === 'long')
      ? triggered.filter(order => !order.closed && between(order.price, lastPrice, price))
      : triggered.filter(order => !order.closed && between(order.price, price, lastPrice));

    logger.debug(`After filtering left triggered orders: ${JSON.stringify(triggered)}`);

    const orders = updateClosedAndRemaining(signal, triggered);
    logger.verbose(`Updated and closed orders: ${JSON.stringify(orders)}`);

    if (orders.length) {
      logger.info(`Notify clients about updated signal ${signal.id}`);

      signalsToSend.push({
        ...signal,
        comment: `Signal order(s) triggered: ${orders.map(o => `of type ${o.type} @ ${o.price}`).join(',')}`,
        commentLocalized: {
          key: 'preview.signal_level_triggered',
          ordersIds: orders.map(o => o.id),
          orders: orders.map(o => `${o.type} @ ${o.price}`).join(','),
          ticker,
          title: signal.title,
          signalId: signal.id
        }
      });

      promises.push(...[
        Signal.update({
          remaining: signal.remaining,
          status: signal.status,
          lastPrice: signal.lastPrice,
          profitability: signal.profitability
        }, {
          where: { id: signal.id },
          returning: true,
          plain: true
        }),
        ...orders.map(order => Order.update({ closed: order.closed, closedVolume: order.closedVolume }, { where: { id: order.id } }))
      ]);
    }
  });

  logger.debug(`Begin awaiting for signals and orders update at ${new Date()} (${new Date().getTime()})`);
  await Promise.all(promises);
  logger.debug(`Finished awaiting for signals and orders update at ${new Date()} (${new Date().getTime()})`);

  if (signalsToSend.length) {
    ws.sendSignals(signalsToSend);
  }

  logger.info(`Data frame handling finished for ticker ${ticker} @ ${price} at ${new Date()} (${new Date().getTime()})`);
};

const reloadSignalsFromDb = async () => {
  const { count, signals } = await Signal.findManyWithRefs({
    where: {
      status: {
        [Sequelize.Op.in]: [SignalStatus.Delayed, SignalStatus.Active]
      }
    }
  }, { skipComments: true });
  const plain = signals.map(({ signal, entryPoints, takeProfitOrders, stopLossOrders }) => {
    signal = signal.get();

    signal.entryPoints = _.chain(entryPoints)
      .map(item => item.get())
      .sortBy('price');
    signal.entryPoints = signal.type === 'long'
      ? signal.entryPoints.reverse().value()
      : signal.entryPoints.value();

    signal.takeProfitOrders = _.chain(takeProfitOrders)
      .filter(order => !order.closed)
      .map(item => item.get())
      .sortBy('price')
      .value();

    signal.stopLossOrders = _.chain(stopLossOrders)
      .filter(order => !order.closed)
      .map(item => item.get())
      .sortBy('price')
      .value();

    return signal;
  });

  signalsCache = _.groupBy(plain, 'ticker');

  logger.info(`reloadSignalsFromDb:: updated ${count} signals, tickers: ${Object.keys(signalsCache).join(',')}`);
};

const setWS = (websocketClallbacks) => {
  Object.keys(websocketClallbacks).forEach(key => {
    ws[key] = websocketClallbacks[key];
  });
};

module.exports = {
  priceCache,

  reloadSignalsFromDb,
  handleDataFrame,

  setWS
};
