require('module-alias/register');

const express = require('express');
require('express-async-errors');
const cors = require('cors');
const bodyParser = require('body-parser');
const bearerToken = require('express-bearer-token');
const http = require('http');
const RateLimit = require('express-rate-limit');
const logger = require('./server/logger');
const wsServer = require('./server/websocket-server');
const config = require('./server/config');
const { init: initDb } = require('./server/db');

const initBinance = require('./server/binance');

const errorHandlers = require('./server/routers/error-handlers');

const middleware = require('./server/middleware');

const accountRouter = require('./server/routers/account-router');
const adminRouter = require('./server/routers/admin-router');
const signalRouter = require('./server/routers/signal-router');

const promiseApp = async () => {
  return new Promise((resolve, reject) => {
    var app = express();

    app.disable('x-powered-by');
    app.enable('trust proxy');

    app.use('/api/', new RateLimit(config.rateLimitOptions));
    app.use(middleware.redirectToHttps);

    app.use(bodyParser.json({ limit: '4mb' }));
    app.use(bodyParser.urlencoded({ extended: false, limit: '4mb' }));
    app.use(bearerToken(config.bearerOptions));

    app.use(cors(config.cors));
    app.options('*', cors(config.cors));

    app.use(middleware.userTokenMiddleware);

    app.use(middleware.compression);
    app.use(middleware.staticFileMiddleware);

    [
      accountRouter,
      adminRouter,
      signalRouter
    ].forEach(router => app.use('/api/', router));

    app.use(errorHandlers.error);
    app.use(errorHandlers.notFound);

    app.use(middleware.history);

    resolve(app);
  });
};

const promiseServer = async (app) => {
  return new Promise((resolve, reject) => {
    const server = http.Server(app);
    wsServer.init(server);
    logger.info('Websockets started');
    resolve(server);
  });
};

const promiseRun = (server) => {
  return new Promise((resolve, reject) => {
    server.listen(config.port, () => {
      logger.info('Server running on the port ' + config.port);
      resolve();
    });
  });
};

async function initialize () {
  await initDb();
  logger.info('Database connection initialized.');

  const app = await promiseApp();
  const server = await promiseServer(app);
  logger.info('Server initialized.');

  await promiseRun(server);

  await initBinance();
}

initialize();
