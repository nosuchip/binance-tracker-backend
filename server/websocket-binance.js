const { EventEmitter } = require('events');
const ReconnectingWebsocket = require('reconnecting-websocket');
const logger = require('./logger');
const WebSocket = require('ws');

const BINANCE_WS_URI = 'wss://stream.binance.com:9443/ws';

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

  updateSignals (signals) {
    const conditions = {};

    logger.debug(`Binance.updateSignals ${JSON.stringify(signals)}`);

    signals.forEach((signal) => {
      if (!signal.id) {
        return;
      }

      if (!conditions[signal.ticker]) {
        conditions[signal.ticker] = [];
      }

      const cond = ({ price }) => {
        if (price > signal.price) {
          return { ...signal, status: 'above' };
        }

        if (price < signal.price) {
          return { ...signal, status: 'below' };
        }

        return null;
      };

      conditions[signal.ticker].push(cond);
    });

    this.conditions = conditions;
  }
}

module.exports = new BinanceTracker(BINANCE_WS_URI);
