const binanceWS = require('@base/websocket-binance');
const { sequelize } = require('@db/database');
const logger = require('@base/logger');

const updateSubscriptions = async (signals) => {
  const SignalModel = sequelize._.Signal;
  const allSignals = await SignalModel.findAll();
  const tickers = allSignals.map(signal => signal.ticker);

  const tickersAlreadySubscribed = tickers.filter(ticker => binanceWS.tickersSubs.includes(ticker));
  logger.info(`updateSubscriptions: Keep subscription to tickers: ${JSON.stringify(tickersAlreadySubscribed)}`);

  const tickersToUnsubscribe = binanceWS.tickersSubs.filter(ticker => !tickers.includes(ticker));
  logger.info(`updateSubscriptions: Unsubscribing from removed tickers: ${JSON.stringify(tickersToUnsubscribe)}`);
  binanceWS.unsubscribeTicker(tickersToUnsubscribe);

  const tickersToSubscribe = tickers.filter(ticker => !binanceWS.tickersSubs.includes(ticker));
  logger.info(`updateSubscriptions: Subscribing to added tickers: ${JSON.stringify(tickersToSubscribe)}`);
  binanceWS.subscribeTicker(tickersToSubscribe);
};

const afterCreate = async (_signal) => {
  console.log('signal after create');
  await updateSubscriptions();
};

const afterUpdate = async (_signal) => {
  console.log('signal after update');
  await updateSubscriptions();
};

const afterDestroy = async (_signal) => {
  console.log('signal after update');
  await updateSubscriptions();
};

module.exports = {
  afterCreate,
  afterUpdate,
  afterDestroy
};
