const binanceWs = require('./websocket-binance');
const serverWs = require('./websocket-server');
const logger = require('./logger');

const tradeSignalCache = {};

const handleTradeMessage = function (message) {
  const { s: ticker, p: price } = message;
  const conds = this.conditions[ticker] || [];

  logger.debug(`Binance.handleMessage for ticker ${ticker}, price ${price}`);

  for (const condition of conds) {
    const signal = condition({ ticker, price: parseFloat(price) });

    if (signal) {
      const { status, ...rest } = signal;
      const payload = { id: signal.id, signal: rest, status, ticker, price: parseFloat(price) };

      const cached = tradeSignalCache[signal.id];

      if (cached && cached.status === payload.status) {
        logger.debug(`handleTradeMessage:: skip 'signal' emitting because cache status was the same "${status}"`);
        continue;
      }

      tradeSignalCache[signal.id] = payload;

      logger.verbose(`handleTradeMessage:: broadcasting 'signal' to clients with payload ${JSON.stringify(payload)}`);
      serverWs.broadcast('signal', payload);
    }
  }
};

module.exports = () => {
  binanceWs.on('trade', handleTradeMessage.bind(binanceWs));

  binanceWs.subscribeTicker(['BTCUSDT', 'ETHUSDT']);
  binanceWs.updateSignals([
    { id: 1, ticker: 'BTCUSDT', price: 10590 },
    { id: 2, ticker: 'ETHUSDT', price: 340 }
  ]);
};
