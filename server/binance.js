const _ = require('lodash');
const binanceWs = require('./websocket-binance');
const serverWs = require('./websocket-server');
const logger = require('./logger');
const { Signal, User, History, Sequelize, sequelize } = require('./db/index');
const config = require('./config');

const { decode } = require('@base/libs/token');
const { isPaid } = require('@base/libs/user');
const { updateSignals, handleDataFrame } = require('@base/libs/level-checker');

const SPARKLINE_LENGTH = 30;

const tradeSignalCache = {};

/*
  {
    signalId: {
      members: [ wsClientId, wsClientId, ... ]
    },
    signalId: {
      members: [ wsClientId, wsClientId, ... ]
    },
    ...
  }
*/
const signalsRooms = {};

/*
  {
    ticker: {
      sparkline: [],
      members: [ wsClientId, wsClientId, ... ]
    },
    ticker: {
      sparkline: [],
      members: [ wsClientId, wsClientId, ... ]
    },
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
      sparklineRooms[ticker] = { sparkline: [], members: [], timestamp: 0 };
    }

    if (!sparklineRooms[ticker].members.includes(client.clientId)) {
      sparklineRooms[ticker].members.push(client.clientId);
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
    if (sparklineRooms[ticker] && sparklineRooms[ticker].members) {
      const index = sparklineRooms[ticker].members.indexOf(client.clientId);
      sparklineRooms[ticker].members.splice(index, 1);
    }
  });

  serverWs.send('subscribe_sparkline_response', { success: true, signals: userSignals.map(signal => signal.id) }, client);
});

module.exports = async () => {
  binanceWs.on('open', () => updateSignals());
  binanceWs.on('trade', handleDataFrame);

  const signals = await sequelize.query('SELECT id, ticker, price FROM Signals', { raw: true, type: Sequelize.QueryTypes.SELECT });
  const tickers = Array.from(new Set(signals.map(signal => signal.ticker)));

  await updateSignals();
  binanceWs.subscribeTicker(tickers);

  // binanceWs.updateSignals(signals);

  serverWs.on('subscribe_signals', handleClientSubscribeSignals);
  serverWs.on('unsubscribe_signals', handleClientUnsubscribeSignals);
  serverWs.on('subscribe_sparklines', handleClientSubscribeSparklines);
  serverWs.on('unsubscribe_sparklines', handleClientUnsubscribeSparklines);
};
