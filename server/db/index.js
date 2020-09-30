const { sequelize, checkConnection } = require('./database');

const { User } = require('./models/user');
const { Signal } = require('./models/signal');
const { Post } = require('./models/post');
const { Comment } = require('./models/comment');

const { associate } = require('./models/associations');

const seedData = require('./seed');

const init = async () => {
  await associate();
  // await sequelize.sync({ force: true });
  // await seedData();
};

module.exports = {
  sequelize,
  checkConnection,

  User,
  Signal,
  Post,
  Comment,

  init
};
