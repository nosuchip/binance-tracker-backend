const _ = require('lodash');
const binanceWs = require('./websocket-binance');
const serverWs = require('./websocket-server');
const { Signal, User, Sequelize, sequelize } = require('./db/index');
const logger = require('@base/logger');

const { decode } = require('@base/libs/token');
const { isPaid } = require('@base/libs/user');
const { reloadSignalsFromDb, handleDataFrame, setWS } = require('@base/libs/level-checker');
const { eventbus, EVENT_RELOAD_SIGNALS } = require('./libs/eventbus');

/*
  {
    signalId: { members: [ wsClientId, wsClientId, ... ] },
    signalId: { members: [ wsClientId, wsClientId, ... ] },
    ...
  }
*/
const signalsRooms = {};

/*
  {
    ticker: [ wsClientId, wsClientId, ... ],
    ticker: [ wsClientId, wsClientId, ... ],
    ...
  };

*/
const sparklineRooms = {};

const getUserQuery = (user, overloads = {}) => {
  const where = {};

  const paid = user ? isPaid(user) : false;

  if (!paid) {
    where.paid = false;
  }

  return {
    where: {
      ...where,
      ...overloads
    }
  };
};

const signalsMiddleware = (fn) => {
  return async (payload, client, server) => {
    const { token, signals } = payload;

    let user = null;

    const { userId = '' } = decode(token);

    if (userId) {
      user = await User.findOne({ where: { id: userId } });
    }

    const userSignals = await Signal.findAll(getUserQuery(user, {
      id: {
        [Sequelize.Op.in]: signals
      }
    }));

    return fn(userSignals, payload, client, server);
  };
};

const handleClientSubscribeSignals = signalsMiddleware((userSignals, _payload, client) => {
  userSignals.forEach(signal => {
    if (!signalsRooms[signal.id]) {
      signalsRooms[signal.id] = { members: [] };
    }

    if (!signalsRooms[signal.id].members.includes(client.clientId)) {
      signalsRooms[signal.id].members.push(client.clientId);
    }
  });

  serverWs.send('subscribe_tickers_response', { success: true, signals: userSignals.map(signal => signal.id) }, client);
});

const handleClientSubscribeSparklines = signalsMiddleware((userSignals, _payload, client) => {
  const tickers = Array.from(new Set(userSignals.map(signal => signal.ticker)));

  tickers.forEach(ticker => {
    if (!sparklineRooms[ticker]) {
      sparklineRooms[ticker] = [];
    }

    if (!sparklineRooms[ticker].includes(client.clientId)) {
      sparklineRooms[ticker].push(client.clientId);
    }
  });

  serverWs.send('subscribe_sparkline_response', { success: true, signals: userSignals.map(signal => signal.id) }, client);
});

const handleClientUnsubscribeSignals = signalsMiddleware((userSignals, _payload, client) => {
  userSignals.forEach(signal => {
    if (signalsRooms[signal.id] && signalsRooms[signal.id].members) {
      const index = signalsRooms[signal.id].members.indexOf(client.clientId);
      signalsRooms[signal.id].members.splice(index, 1);
    }
  });

  serverWs.send('unsubscribe_tickers_response', { success: true, signals: userSignals.map(signal => signal.id) }, client);
});

const handleClientUnsubscribeSparklines = signalsMiddleware((userSignals, _payload, client) => {
  const tickers = Array.from(new Set(userSignals.map(signal => signal.ticker)));

  tickers.forEach(ticker => {
    if (sparklineRooms[ticker]) {
      const index = sparklineRooms[ticker].indexOf(client.clientId);
      sparklineRooms[ticker].splice(index, 1);
    }
  });

  serverWs.send('subscribe_sparkline_response', { success: true, signals: userSignals.map(signal => signal.id) }, client);
});

module.exports = async () => {
  const sendSignal = (signal) => {
    logger.verbose(`sendSignal:: broadcasting 'signal' to clients with payload ${JSON.stringify(signal)}`);

    const clients = _.get(signalsRooms[signal.id], 'members', []);
    serverWs.broadcast('signal', signal, clients);
  };

  const sendSignals = (signals) => {
    signals.forEach(sendSignal);
  };

  const sendSparkline = ({ ticker, data, _timestamp }) => {
    const members = sparklineRooms[ticker] || [];
    serverWs.broadcast('sparkline', { sparkline: data, ticker }, members);
  };

  setWS({ sendSignal, sendSignals, sendSparkline });

  eventbus.on(EVENT_RELOAD_SIGNALS, async () => {
    logger.info('Got eventbus EVENT_RELOAD_SIGNALS event');
    reloadSignalsFromDb();
  });

  binanceWs.on('open', () => reloadSignalsFromDb());
  binanceWs.on('trade', (message) => handleDataFrame(message));

  const signals = await sequelize.query('SELECT id, ticker, price FROM Signals', { raw: true, type: Sequelize.QueryTypes.SELECT });
  const tickers = Array.from(new Set(signals.map(signal => signal.ticker)));

  binanceWs.subscribeTicker(tickers);

  serverWs.on('subscribe_signals', handleClientSubscribeSignals);
  serverWs.on('unsubscribe_signals', handleClientUnsubscribeSignals);
  serverWs.on('subscribe_sparklines', handleClientSubscribeSparklines);
  serverWs.on('unsubscribe_sparklines', handleClientUnsubscribeSparklines);

  eventbus.emit(EVENT_RELOAD_SIGNALS);
};
