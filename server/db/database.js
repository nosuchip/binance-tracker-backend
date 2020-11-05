const { Sequelize } = require('sequelize');

const config = require('../config');
const logger = require('../logger');

Sequelize.postgres.DECIMAL.parse = (value) => parseFloat(value);

const sequelize = new Sequelize(config.databaseUri, {
  ...config.databaseOpts
});

async function checkConnection () {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established');
  } catch (error) {
    logger.info(`Database connection error ${error}`);
    throw error;
  }
}

module.exports = {
  sequelize,
  Sequelize,
  checkConnection
};
