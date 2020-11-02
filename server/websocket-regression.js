const WebSocket = require('ws');
const logger = require('./logger');
const config = require('./config');
const { eventbus, EVENT_REGRESSION_DATA } = require('./libs/eventbus');

function setupRegressionWebsocket () {
  let count = 0;

  const serialize = (event, payload = {}) => JSON.stringify({ event, payload });

  if (!config.regressionWsPort) {
    logger.warn('Regression WS port not defined (REGRESSION_WS_PORT), listener won\'t start');
    return;
  }

  const onMessage = (message) => {
    const { price, ticker, date } = JSON.parse(message);

    const timestamp = Math.round(new Date(date).getTime() / 1000);

    const event = {
      e: 'trade',
      s: ticker.replace(/[^A-Z]/g, ''),
      p: price.toString(),
      T: timestamp,
      regression: true,

      E: timestamp,
      t: timestamp,
      q: '1',
      b: (1000 + count).toString(),
      a: (2000 + count).toString(),
      m: true,
      M: true
    };

    eventbus.emit(EVENT_REGRESSION_DATA, event);
    count++;
  };

  const socket = new WebSocket.Server({ port: config.regressionWsPort });

  socket.on('connection', (ws) => {
    logger.info('Regression websocket connected');
    ws.send(serialize('regression connected'));
    ws.on('message', onMessage);
  });
}

module.exports = setupRegressionWebsocket;
