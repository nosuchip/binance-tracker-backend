const { EventEmitter } = require('events');
const ReconnectingWebsocket = require('reconnecting-websocket');
const logger = require('./logger');
const WebSocket = require('ws');
const config = require('./config');

class BinanceTracker extends EventEmitter {
  constructor (uri) {
    super();

    const options = {
      WebSocket
    };

    this.conditions = {};
    this.messageId = 1;
    this.tickersSubs = [];

    this.rws = new ReconnectingWebsocket(uri, [], options);
    this.rws.addEventListener('open', () => {
      logger.info('BinanceTracker socket connected');

      this.emit('open');
    });

    this.rws.addEventListener('message', ({ data }) => {
      const message = JSON.parse(data);
      const { e: event } = message;

      logger.debug(`BinanceTracker.message:: received payload ${JSON.stringify(message)}`);

      if (event) {
        this.emit(event, message);
      }
    });
  }

  send (payload) {
    if (!payload.id) {
      payload.id = this.messageId++;
    }

    logger.debug(`BinanceTracker.send:: payload: ${JSON.stringify(payload)}`);

    this.rws.send(JSON.stringify(payload));
  }

  subscribeTicker (tickers) {
    if (!Array.isArray(tickers)) {
      tickers = [tickers];
    }

    tickers = tickers
      .map((ticker) => ticker.toLowerCase())
      .filter((ticker) => !this.tickersSubs.includes(ticker));

    logger.info(`Binance.subscribeTicker ${JSON.stringify(tickers)}`);

    this.send({
      method: 'SUBSCRIBE',
      params: tickers.map((ticker) => `${ticker}@trade`)
    });

    this.tickersSubs.push(...tickers);
  }

  unsubscribeTicker (tickers) {
    if (!Array.isArray(tickers)) {
      tickers = [tickers];
    }

    tickers = tickers
      .map((ticker) => ticker.toLowerCase())
      .filter((ticker) => this.tickersSubs.includes(ticker));

    logger.info(`Binance.unsubscribeTicker ${JSON.stringify(tickers)}`);

    this.send({
      method: 'UNSUBSCRIBE',
      params: tickers.map((ticker) => `${ticker}@aggTrade`)
    });

    this.tickersSubs = this.tickersSubs.filter(ticker => !tickers.includes(ticker));
  }
}

module.exports = new BinanceTracker(config.binanceUri);
