const { sequelize, Sequelize, checkConnection } = require('./database');
const logger = require('@base/logger');

const { User } = require('./models/user');
const { Signal, SignalStatus, SignalType } = require('./models/signal');
const { Post } = require('./models/post');
const { Comment } = require('./models/comment');
const { EntryPoint } = require('./models/entrypoint');
const { Order } = require('./models/order');
const { History } = require('./models/history');
const { Channel } = require('./models/channel');
const { Log } = require('./models/log');

const { associate } = require('./models/associations');

const init = async () => {
  await associate();

  try {
    logger.info('Initializing DB connection and checking for result...');
    await checkConnection();
    logger.info('DB connected');
  } catch (error) {
    logger.error(`DB connection fail: ${error.toString()}`);
  }
};

module.exports = {
  sequelize,
  Sequelize,
  checkConnection,

  User,
  Signal,
  Post,
  Comment,
  EntryPoint,
  Order,
  History,
  Channel,
  Log,

  SignalStatus,
  SignalType,

  init
};
