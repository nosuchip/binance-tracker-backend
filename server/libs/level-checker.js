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
const updateClosedAndRemaining = (signal, triggeredTP, triggeredSL) => {
  const ordersToUpdate = [];

  const handleOrders = (orders) => {
    if (!orders || signal.status !== SignalStatus.Active || !signal.remaining) return;

    for (const order of orders) {
      order.closed = true;

      if (signal.remaining - order.volume >= 0) {
        order.closedVolume = order.volume;
        signal.remaining -= order.volume;

        ordersToUpdate.push(order);
      } else {
        order.closedVolume = signal.remaining;
        signal.status = SignalStatus.Finished;
        signal.remaining = 0;

        ordersToUpdate.push(order);
        break;
      }
    }
  };

  handleOrders(triggeredTP);
  handleOrders(triggeredSL);

  return ordersToUpdate;
};

// const checkLong = (currentPrice, prevPrice, signal) => {
//   const triggeredTP = currentPrice > prevPrice
//     ? signal.takeProfitOrders.filter(order => !order.closed && order.price <= currentPrice)
//     : [];
//   const untriggeredTP = currentPrice > prevPrice
//     ? signal.takeProfitOrders.filter(order => !order.closed && order.price > currentPrice)
//     : [];

//   const triggeredSL = currentPrice < prevPrice
//     ? signal.stopLossOrders.filter(order => !order.closed && order.price >= currentPrice)
//     : [];
//   const untriggeredSL = currentPrice < prevPrice
//     ? signal.stopLossOrders.filter(order => !order.closed && order.price < currentPrice)
//     : [];

//   return updateClosedAndRemaining(signal, triggeredTP, triggeredSL);
// };

// const checkShort = (currentPrice, prevPrice, signal) => {
//   const triggeredTP = currentPrice < prevPrice
//     ? signal.takeProfitOrders.filter(order => !order.closed && order.price >= currentPrice)
//     : [];
//   const untriggeredTP = currentPrice > prevPrice
//     ? signal.takeProfitOrders.filter(order => !order.closed && order.price < currentPrice)
//     : [];

//   const triggeredSL = currentPrice > prevPrice
//     ? signal.stopLossOrders.filter(order => !order.closed && order.price <= currentPrice)
//     : [];
//   const untriggeredSL = currentPrice > prevPrice
//     ? signal.stopLossOrders.filter(order => !order.closed && order.price > currentPrice)
//     : [];

//   return updateClosedAndRemaining(signal, triggeredTP, triggeredSL);
// }

const between = (value, top, bottom) => {
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
      // For long valid only if price going up
      const longPriceMatch = signal.type === 'long' && between(entryPoint.price, price, lastPrice);

      // For short valid only if price going down
      const shortPriceMatch = signal.type === 'short' && between(entryPoint.price, lastPrice, price);

      if (longPriceMatch || shortPriceMatch) {
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

  logger.debug(`Data frame handling begin for ticker ${ticker} @ ${price} at ${new Date()} (${new Date().getTime()})`);

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

  if (type === 'long') {
    // Check all types of signals, for long signals check only TP, for short signals check only SL

    signalsToCheck.forEach(signal => {
      let orders = [];

      if (signal.type === 'long') {
        const triggeredTP = signal.takeProfitOrders.filter(order => !order.closed && order.price <= price);
        orders = updateClosedAndRemaining(signal, triggeredTP, null);
      } else if (signal.type === 'short') {
        const triggeredSL = signal.stopLossOrders.filter(order => !order.closed && order.price >= price);
        orders = updateClosedAndRemaining(signal, null, triggeredSL);
      }

      // TODO: as improvement could be added compare signal for dirtyness and if it is - save, otherwise do noot do DB call
      promises.push(...[
        Signal.update({ remaining: signal.remaining, status: signal.status }, { where: { id: signal.id } }),
        ...orders.map(order => Order.update({ closed: true, closedVolume: order.closedVolume }, { where: { id: order.id } }))
      ]);
    });
  } else if (type === 'short') {
    // Check all types of signals, for long signals check only SL, for short signals check only TP

    signalsToCheck.forEach(signal => {
      let orders = [];

      if (signal.type === 'long') {
        const triggeredTP = signal.stopLossOrders.filter(order => !order.closed && order.price >= price);
        orders = updateClosedAndRemaining(signal, triggeredTP, null);
      } else if (signal.type === 'short') {
        const triggeredSL = signal.takeProfitOrders.filter(order => !order.closed && order.price <= price);
        orders = updateClosedAndRemaining(signal, null, triggeredSL);
      }

      // TODO: as improvement could be added compare signal for dirtyness and if it is - save, otherwise do noot do DB call
      promises.push(...[
        Signal.update({ remaining: signal.remaining, status: signal.status }, { where: { id: signal.id } }),
        ...orders.map(order => Order.update({ closed: true, closedVolume: order.closedVolume }, { where: { id: order.id } }))
      ]);
    });
  }

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
