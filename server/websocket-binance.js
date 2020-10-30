const { EventEmitter } = require('events');
const ReconnectingWebsocket = require('reconnecting-websocket');
const logger = require('./logger');
const WebSocket = require('ws');
const config = require('./config');
const { safeTicker } = require('./libs/ticker');

const DATA_CHECK_INTERVAL_MS = parseInt(process.env.DATA_CHECK_INTERVAL_MS);
const MAX_DATA_CHECK_INTERVAL_MS = parseInt(process.env.MAX_DATA_CHECK_INTERVAL_MS);

class BinanceTracker extends EventEmitter {
  constructor (uri) {
    super();

    const options = {
      WebSocket
    };

    this.conditions = {};
    this.messageId = 1;
    this.tickersSubs = [];

    this.dataCheckTimeout = DATA_CHECK_INTERVAL_MS;
    this.dataCheckTimer = null;

    this.rws = new ReconnectingWebsocket(uri, [], options);
    this.rws.addEventListener('open', () => {
      logger.info('BinanceTracker socket connected');

      if (this.tickersSubs.length) {
        this.subscribeTicker(this.tickersSubs, true);
      }

      this.emit('open');
    });

    this.rws.addEventListener('message', ({ data }) => {
      this.dataCheckTimeout = DATA_CHECK_INTERVAL_MS;
      this.restartDataTimer();

      const message = JSON.parse(data);
      const { e: event } = message;

      logger.debug(`BinanceTracker.message:: received payload ${JSON.stringify(message)}`);

      if (event) {
        this.emit(event, message);
      }
    });
  }

  restartDataTimer () {
    if (!DATA_CHECK_INTERVAL_MS || !MAX_DATA_CHECK_INTERVAL_MS) {
      logger.silly(`DATA_CHECK_INTERVAL_MS=${DATA_CHECK_INTERVAL_MS} or MAX_DATA_CHECK_INTERVAL_MS=${MAX_DATA_CHECK_INTERVAL_MS} empty, data check timer disabled`);

      return;
    }

    if (this.dataCheckTimer) {
      clearTimeout(this.dataCheckTimer);
    }

    logger.debug(`Resetting data check timer for ${this.dataCheckTimeout}ms after now`);

    this.dataCheckTimer = setTimeout(() => {
      this.dataCheckTimer = null;

      if (this.tickersSubs.length) {
        logger.warn(`In ${this.dataCheckTimeout}ms after last data no new data received while have active ` +
          `subscriptions "${this.tickersSubs.join(',')}" (probably socket stuck), forcibly reconnecting`);

        this.dataCheckTimeout += DATA_CHECK_INTERVAL_MS;

        if (this.dataCheckTimeout > MAX_DATA_CHECK_INTERVAL_MS) {
          this.dataCheckTimeout = MAX_DATA_CHECK_INTERVAL_MS;
        }

        this.rws.reconnect();
      } else {
        logger.debug('Data check time out but haven\'t active subscriptions, just restart timer');
      }

      this.restartDataTimer();
    }, this.dataCheckTimeout);
  }

  send (payload) {
    if (!payload.id) {
      payload.id = this.messageId++;
    }

    logger.debug(`BinanceTracker.send:: payload: ${JSON.stringify(payload)}`);

    this.rws.send(JSON.stringify(payload));
  }

  subscribeTicker (tickers, force) {
    if (!Array.isArray(tickers)) {
      tickers = [tickers];
    }

    tickers = tickers.map(ticker => safeTicker(ticker));

    const newTickers = tickers
      .map((ticker) => ticker.toLowerCase())
      .filter((ticker) => !this.tickersSubs.includes(ticker));

    tickers = force ? tickers : newTickers;

    if (!tickers.length) {
      logger.info(`Binance.subscribeTicker attempted to subscribe with empty tickers list ${JSON.stringify(tickers)}, skipping`);
      return;
    }

    logger.info(`Binance.subscribeTicker ${JSON.stringify(tickers)}`);

    this.send({
      method: 'SUBSCRIBE',
      params: (tickers).map((ticker) => `${ticker}@trade`)
    });

    this.tickersSubs.push(...newTickers);
  }

  unsubscribeTicker (tickers) {
    if (!Array.isArray(tickers)) {
      tickers = [tickers];
    }

    tickers = tickers.map(ticker => safeTicker(ticker));

    tickers = tickers
      .map((ticker) => ticker.toLowerCase())
      .filter((ticker) => this.tickersSubs.includes(ticker));

    if (!tickers.length) {
      logger.info(`Binance.unsubscribeTicker attempted to unsubscribe with empty tickers list ${JSON.stringify(tickers)}, skipping`);
      return;
    }

    logger.info(`Binance.unsubscribeTicker ${JSON.stringify(tickers)}`);

    this.send({
      method: 'UNSUBSCRIBE',
      params: tickers.map((ticker) => `${ticker}@aggTrade`)
    });

    this.tickersSubs = this.tickersSubs.filter(ticker => !tickers.includes(ticker));
  }
}

module.exports = new BinanceTracker(config.binanceUri);
