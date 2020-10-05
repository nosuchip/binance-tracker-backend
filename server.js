require('module-alias/register');

const express = require('express');
require('express-async-errors');
const cors = require('cors');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const boom = require('express-boom');
const bearerToken = require('express-bearer-token');
const http = require('http');
const socketIO = require('socket.io');
const RateLimit = require('express-rate-limit');

const logger = require('./server/logger');
const ws = require('./server/websockets');
const config = require('./server/config');
const db = require('./server/db');

const errorHandlers = require('./server/routes/error-handlers');

const middleware = require('./server/middleware');

const accountRouter = require('./server/routes/account-router');
const adminrouter = require('./server/routes/admin-router');
const appRouter = require('./server/routes/app-router');

const promiseApp = async () => {
  return new Promise((resolve, reject) => {
    var app = express();

    app.disable('x-powered-by');
    app.enable('trust proxy');

    app.use(new RateLimit(config.rateLimitOptions));
    app.use(middleware.redirectToHttps);

    app.use(boom());
    app.use(bodyParser.json({ limit: '4mb' }));
    app.use(bodyParser.urlencoded({ extended: false, limit: '4mb' }));
    app.use(methodOverride());
    app.use(bearerToken(config.bearerOptions));

    app.use(cors(config.cors));
    app.options('*', cors(config.cors));

    app.use(middleware.userTokenMiddleware);

    app.use(middleware.compression);
    app.use(middleware.staticFileMiddleware);

    app.use('/api/', appRouter);
    app.use('/api/account', accountRouter);
    app.use('/api/admin', adminrouter);

    app.use(errorHandlers.error);
    app.use(errorHandlers.notFound);

    app.use(middleware.history);

    resolve(app);
  });
};

const promiseServer = async (app) => {
  return new Promise((resolve, reject) => {
    const server = http.Server(app);

    ws.start(socketIO(server));
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

async function initialize() {
  await db.initialize();
  logger.info('Database connection initialized.');

  const app = await promiseApp();
  const server = await promiseServer(app);
  logger.info('Server initialized.');

  await promiseRun(server);

  console.log(`Server listening on port ${config.port}`);
}

initialize();
