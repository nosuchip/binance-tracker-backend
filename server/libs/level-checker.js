const _ = require('lodash');
const { Signal, Order, History, SignalStatus, SignalType, Sequelize, Log, EntryPoint } = require('@base/db');
const logger = require('@base/logger');
const config = require('@base/config');

const SPARKLINE_LENGTH = 30;

const ws = {
  sendSignal: null,
  sendSignals: null,
  sendSparkline: null
};

const between = (value, bottom, top) => (value >= bottom) && (value <= top);

const findFirstBetween = (list, bottom, top, getter = null) => {
  const forward = (arr, cb) => {
    for (let i = 0; i < arr.length; i++) {
      if (cb(arr[i], i) === false) {
        break;
      }
    }
  };

  const backward = (arr, cb) => {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (cb(arr[i], i) === false) {
        break;
      }
    }
  };

  let found = null;

  const predicate = (item) => {
    const value = getter ? getter(item) : item;
    const isBetween = bottom >= top ? between(value, top, bottom) : between(value, bottom, top);

    logger.debug(`Check is EP ${JSON.stringify(item)} between ${bottom} and ${top}: ${isBetween}`);

    if (isBetween) {
      found = item;
      return false;
    }
  };

  bottom >= top ? backward(list, predicate) : forward(list, predicate);

  return found;
};

const loadSignals = async (query) => {
  let { count, signals } = await Signal.findManyWithRefs(query, { skipComments: true });

  signals = signals.map(({ signal, entryPoints, takeProfitOrders, stopLossOrders }) => {
    signal = signal.get();

    signal.entryPoints = _.chain(entryPoints)
      .map(item => item.get())
      .sortBy('price')
      .value();

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

  return { count, signals };
};

class LevelChecker {
  constructor ({ types } = {}) {
    if (!Array.isArray(types)) {
      throw new Error('"types" must be array of signal types');
    }

    this.types = types;

    this.priceCache = {
      // ticker: lastPrice
    };

    this.signalsCache = {
      // ticker: [signal1, signal2, ...]
    };

    this.sparklineCache = {
      // ticker: { data, timestamp }
    };
  }

  filterSignalsToActivate (ticker) {
    throw new Error('filterSignalsToActivate must be overriden');
  }

  filterSignalsToCheckOrders (ticker) {
    throw new Error('filterSignalsToCheckOrders must be overriden');
  }

  updatedSignalActivationStatus (signal) {
    throw new Error('updatedSignalActivationStatus must be overriden');
  }

  async reloadSignalsFromDb (signalsOverride) {
    let count, signals;

    if (signalsOverride) {
      ({ count, signals } = signalsOverride);
    } else {
      ({ count, signals } = loadSignals({ where: { status: { [Sequelize.Op.in]: this.types } } }));
    }

    this.signalsCache = _.groupBy(signals, 'ticker');

    logger.info(
      `reloadSignalsFromDb:: updated ${count} signals, tickers: ${Object.keys(this.signalsCache).join(',')} ` +
      `of types ${this.types.join(',')}`
    );
  };

  /**
   * Calculate profitability based on current signal's parameters
   *
   * @param {Signal} signal
   */
  getProfitability (signal) {
    if (!signal || !signal.type || !signal.price || !signal.exitPrice) {
      return 0;
    }

    const profitability = (signal.type === SignalType.Long)
      ? (signal.exitPrice / signal.price - 1) * 100
      : (signal.price / signal.exitPrice - 1) * 100;

    logger.info(`Signal ${signal.id} profitability recalculation, signal type ${signal.type}` +
      `current exit price ${signal.exitPrice}, entry price ${signal.price}, profitability ${profitability}`);

    return profitability;
  };

  /**
   * Save history record to database
   *
   * @param {BinanceMessage} message
   */
  async saveHistory (message) {
    if (config.storeHistory) {
      return History.createFromMessage(message);
    }
  }

  /**
   *
   * @param {String} ticker
   * @param {Number} price
   * @param {Number} timestamp
   */
  updateSparkline (ticker, price, timestamp) {
    let spark = this.sparklineCache[ticker];

    if (!spark) {
      this.sparklineCache[ticker] = { data: [], timestamp };
      spark = this.sparklineCache[ticker];
    }

    spark.timestamp = timestamp;

    if (spark.data.length === SPARKLINE_LENGTH) {
      spark.data.shift();
    }

    spark.data.push(parseFloat(price));

    logger.debug(`Sparkline updated for ticker ${ticker}, sparkline: ${JSON.stringify(spark)}`);

    ws.sendSparkline({ ticker, data: spark.data, timestamp: spark.timestamp });
  }

  /**
   *
   * @param {number} id
   * @param {Order[]} triggeredTP
   * @param {Order[]} triggeredSL
   */
  updateClosedAndRemaining (signal, orders, price, now) {
    const ordersToUpdate = [];

    if (!orders || !signal.remaining) return;

    for (const order of orders) {
      order.closed = true;
      order.triggerDate = now || new Date();
      order.triggerPrice = price;

      if (signal.remaining - order.volume > 0) {
        order.closedVolume = order.volume;

        signal.remaining -= order.volume;
        signal.lastPrice = order.price;
        signal.exitPrice += order.closedVolume * order.price;
        signal.profitability = this.getProfitability(signal);

        Log.log('info', `Order ${order.id} closed by full volume ${order.closedVolume}, signal ${signal.id} ` +
          `remaining: ${signal.remaining}, signal last price: ${order.price}, signal exit price: ${signal.exitPrice}, ` +
          `signal profitability: ${signal.profitability}`);

        ordersToUpdate.push(order);
      } else if (signal.remaining) {
        order.closedVolume = signal.remaining;

        signal.status = SignalStatus.Finished;
        signal.remaining = 0;
        signal.lastPrice = order.price;
        signal.exitPrice += order.closedVolume * order.price;
        signal.profitability = this.getProfitability(signal);

        Log.log('info', `Order ${order.id} closed by partial volume ${order.closedVolume}, signal ${signal.id}` +
          ` remaining: ${signal.remaining}, signal last price: ${order.price}, signal exit price: ${signal.exitPrice}, ` +
          `signal profitability: ${signal.profitability}`);

        ordersToUpdate.push(order);
        break;
      }
    }

    return ordersToUpdate;
  }

  /**
   *
   * @param {String}    ticker        Signal ticker
   * @param {Number}    price         Current price for ticker
   * @param {Number}    lastPrice     Previous price for ticker
   */
  activateSignals (ticker, price, lastPrice, now) {
    const signalsToActivates = []; // { id: X, price: Y }

    // Activate only signals whose ticker come in data frame
    const signals = this.filterSignalsToActivate(ticker);

    if (!signals || !signals.length) {
      return signalsToActivates;
    }

    signals.forEach((signal) => {
      const activatedEntryPoint = findFirstBetween(signal.entryPoints, lastPrice, price, ep => ep.price);

      if (activatedEntryPoint) {
        signal.status = this.updatedSignalActivationStatus(signal);
        signal.price = activatedEntryPoint.price;
        signal.lastPrice = activatedEntryPoint.price;
        signalsToActivates.push(signal);

        activatedEntryPoint.triggerDate = now || new Date();
        activatedEntryPoint.triggerPrice = price;
        EntryPoint
          .update({
            triggerDate: activatedEntryPoint.triggerDate,
            triggerPrice: activatedEntryPoint.triggerPrice
          }, {
            where: { id: activatedEntryPoint.id }
          })
          .catch(error => logger.error(`Unable to update entry point: ${error.message}`));

        const message = `Activation: activating signal ${signal.id} by entry points ${activatedEntryPoint.id} @ ` +
                    `${activatedEntryPoint.price} between price ${price} and last price ${lastPrice}`;
        logger.info(message);
        Log.log('info', message);
      } else {
        logger.debug(`Activation: for signal ${signal.id} no entry points were hit between price ${price} ` +
                    `and last price ${lastPrice}`);
      }
    });

    return signalsToActivates;
  }

  async handleDataFrame (message) {
    const signalsToSend = [];
    const ticker = message.s;
    const price = parseFloat(message.p);
    const timestamp = parseInt(message.T);
    const date = new Date(timestamp * 1000);

    let logDataFrame = false;

    logger.info(`------>>> Data frame handling begin for ticker ${ticker} @ ${price} at ${new Date()} (${new Date().getTime()}) <<<------`);

    // Do not await
    this.saveHistory(message);

    if (config.updateSparklines) {
      this.updateSparkline(ticker, price, timestamp);
    }

    const lastPrice = this.priceCache[ticker];
    this.priceCache[ticker] = price;

    if (!lastPrice) {
      logger.info(`No previous price for ticker ${ticker}, unable to determine price dynamic, skip data frame until next`);
      return;
    }

    const activatedSignals = this.activateSignals(ticker, price, lastPrice, date);
    if (activatedSignals && activatedSignals.length) {
      logDataFrame = true;

      logger.info(`Got signal activation for: ${JSON.stringify(activatedSignals)}`);

      await Signal.activateMany(activatedSignals);

      signalsToSend.push(...activatedSignals.map(s => ({
        ...s,
        comment: `Signal activated at price ${s.price}`,
        commentLocalized: { key: 'preview.signal_activated', signalId: s.id, ticker, title: s.title, price: s.price }
      })));
    }

    const type = price > lastPrice ? 'long' : (price < lastPrice ? 'short' : '-');
    logger.debug(`For ${ticker} dynamic changed to type ${type}`);

    const signalsToCheck = this.filterSignalsToCheckOrders(ticker);

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

      if (triggered.length) {
        logDataFrame = true;

        const message = `Level trigger: for signal ${signal.id} levels triggered: ` +
            `${triggered.map(o => `${o.id}@${o.price}`).join(', ')} ` +
            `between price ${price} and last price ${lastPrice}`;
        logger.info(message);
        Log.log('info', message);
      }

      const orders = this.updateClosedAndRemaining(signal, triggered, price, date);
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

    if (logDataFrame) {
      const msg = `Data frame processed successfully and it triggers changes (activation or level), binance data: ${JSON.stringify(message)}`.substr(0, 1020);
      logger.info(msg);
      Log.log('info', msg);
    }

    logger.debug(`Begin awaiting for signals and orders update at ${new Date()} (${new Date().getTime()})`);
    await Promise.all(promises);
    logger.debug(`Finished awaiting for signals and orders update at ${new Date()} (${new Date().getTime()})`);

    if (signalsToSend.length) {
      ws.sendSignals(signalsToSend);
    }

    logger.info(`Data frame handling finished for ticker ${ticker} @ ${price} at ${new Date()} (${new Date().getTime()})`);
  }
}

class RealSignalsLevelChecker extends LevelChecker {
  constructor () {
    super({ types: [SignalStatus.Delayed, SignalStatus.Active] });
  }

  filterSignalsToActivate (ticker) {
    return (this.signalsCache[ticker] || []).filter(signal => signal.status === SignalStatus.Delayed);
  }

  filterSignalsToCheckOrders (ticker) {
    return (this.signalsCache[ticker] || []).filter(signal => signal.status === SignalStatus.Active);
  }

  updatedSignalActivationStatus (signal) {
    return SignalStatus.Active;
  }
}

class RegressionSignalsLevelChecker extends LevelChecker {
  constructor () {
    super({ types: [SignalStatus.Regression] });
  }

  filterSignalsToActivate (ticker) {
    return (this.signalsCache[ticker] || []).filter(signal => signal.status === SignalStatus.Regression && !signal.price);
  }

  filterSignalsToCheckOrders (ticker) {
    // We do not change status of regression signals so only way to determine it is active is to check price
    return (this.signalsCache[ticker] || []).filter(signal => signal.status === SignalStatus.Regression && signal.price);
  }

  updatedSignalActivationStatus (signal) {
    return SignalStatus.Regression;
  }
}

const setWS = (websocketClallbacks) => {
  Object.keys(websocketClallbacks).forEach(key => {
    ws[key] = websocketClallbacks[key];
  });
};

const regressionSignalProcessor = new RegressionSignalsLevelChecker();
const realSignalProcessor = new RealSignalsLevelChecker();

const reloadSignalsFromDb = async () => {
  const types = [SignalStatus.Regression, SignalStatus.Delayed, SignalStatus.Active];
  const { signals } = await loadSignals({ where: { status: { [Sequelize.Op.in]: types } } });

  const regressionSignals = [];
  const realSignals = [];

  signals.forEach(signal => {
    if (signal.status === SignalStatus.Regression) {
      regressionSignals.push(signal);
    } else {
      realSignals.push(signal);
    }
  });

  regressionSignalProcessor.reloadSignalsFromDb({ count: regressionSignals.length, signals: regressionSignals });
  realSignalProcessor.reloadSignalsFromDb({ count: realSignals.length, signals: realSignals });
};

const handleDataFrame = (message) => {
  const { regression, ...rest } = message;

  if (regression) {
    return regressionSignalProcessor.handleDataFrame(rest);
  } else {
    return realSignalProcessor.handleDataFrame(rest);
  }
};

module.exports = {
  reloadSignalsFromDb,
  handleDataFrame,
  setWS
};
