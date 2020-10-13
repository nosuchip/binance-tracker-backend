const _ = require('lodash');
const { Signal, Order, SignalStatus, Sequelize } = require('@base/db');
const logger = require('@base/logger');

var priceCache = {
  // ticker: lastPrice
};

var signalsCache = {
  // ticker: [signal1, signal2, ...]
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
        signalsToActivates.push({ id: signal.id, price: entryPoint.price });
        signal.status = SignalStatus.Active;
        logger.debug(`Activating ${signal.type} signal ${signal.id} at price ${price} (entry point: ${entryPoint.price})`);
        break;
      }
    }
  });

  return signalsToActivates;
};

const handleDataFrame = async (message) => {
  const ticker = message.s;
  const price = parseFloat(message.p);

  logger.debug(`------>>> Data frame handling begin for ticker ${ticker} @ ${price} at ${new Date()} (${new Date().getTime()}) <<<------`);

  const lastPrice = priceCache[ticker];
  priceCache[ticker] = price;

  if (!lastPrice) {
    logger.info(`No previous price for ticker ${ticker}, unable to determine price dynamic, skip data frame until next`);
    return;
  }

  const activatedSignals = activateSignals(ticker, price, lastPrice);
  logger.debug(`${activatedSignals.length} signals activated`);

  if (activatedSignals && activatedSignals.length) {
    // Do not await here, not necessary for data preame processing, all required data already updated in-place
    Signal.activateMany(activatedSignals);
  }

  const type = price > lastPrice ? 'long' : (price < lastPrice ? 'short' : '-');
  logger.debug(`For ${ticker} dynamic changed to type ${type}`);

  const signalsToCheck = (signalsCache[ticker] || []).filter(signal => signal.status === SignalStatus.Active);

  if (!signalsToCheck.length) {
    logger.info(`No signals to analyze for ticker ${ticker} of type ${type}`);
    return;
  }

  const promises = [];

  signalsToCheck.forEach(signal => {
    let triggered = (
      (signal.type === 'long' && type === 'long') ||
      (signal.type === 'short' && type === 'short')
    ) ? signal.takeProfitOrders : signal.stopLossOrders;

    triggered = (type === 'long')
      ? triggered.filter(order => !order.closed && between(order.price, lastPrice, price))
      : triggered.filter(order => !order.closed && between(order.price, price, lastPrice));
    const orders = updateClosedAndRemaining(signal, triggered);

    if (orders.length) {
      promises.push(...[
        Signal.update({
          remaining: signal.remaining,
          status: signal.status,
          lastPrice: signal.lastPrice,
          profitability: signal.profitability
        }, { where: { id: signal.id } }),
        ...orders.map(order => Order.update({ closed: true, closedVolume: order.closedVolume }, { where: { id: order.id } }))
      ]);
    }
  });

  logger.debug(`Begin awaiting for signals and orders update at ${new Date()} (${new Date().getTime()})`);
  await Promise.all(promises);
  logger.debug(`Finished awaiting for signals and orders update at ${new Date()} (${new Date().getTime()})`);

  logger.debug(`Data frame handling finished for ticker ${ticker} @ ${price} at ${new Date()} (${new Date().getTime()})`);
};

const updateSignals = async () => {
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

  logger.debug(`updateSignals:: updated ${count} signals, tickers: ${Object.keys(signalsCache).join(',')}`);
};

module.exports = {
  priceCache,

  updateSignals,
  handleDataFrame
};
