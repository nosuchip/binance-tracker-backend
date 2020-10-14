const { sequelize, Sequelize, checkConnection } = require('./database');

const { User } = require('./models/user');
const { Signal, SignalStatus } = require('./models/signal');
const { Post } = require('./models/post');
const { Comment } = require('./models/comment');
const { EntryPoint } = require('./models/entrypoint');
const { Order } = require('./models/order');
const { History } = require('./models/history');

// const { withCache } = require('./cache');

const { associate } = require('./models/associations');

const init = async () => {
  await associate();
  // await sequelize.sync({ force: true });
};

module.exports = {
  sequelize,
  Sequelize,
  checkConnection,

  // User: withCache(User),
  // Signal: withCache(Signal),
  // Post: withCache(Post),
  // Comment: withCache(Comment),
  // EntryPoint: withCache(EntryPoint),
  // Order: withCache(Order),

  User,
  Signal,
  Post,
  Comment,
  EntryPoint,
  Order,
  History,

  SignalStatus,

  init
};
