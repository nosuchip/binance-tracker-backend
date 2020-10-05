const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database');
const logger = require('@base/logger');

class History extends Model {
  static async createFromMessage (message) {
    const payload = {
      ticker: message.s,
      price: message.p,
      quantity: message.q,
      stream: message.e,
      timestamp: message.T
    };

    if (
      typeof payload.ticker === 'undefined' ||
      typeof payload.price === 'undefined' ||
      typeof payload.stream === 'undefined' ||
      typeof payload.quantity === 'undefined' ||
      typeof payload.timestamp === 'undefined'
    ) {
      logger.debug(`Unable to create History record, some of mandatory fields are empty: ${JSON.stringify(payload)}`);
      return;
    }

    return History.create(payload);
  }
}

History.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ticker: { type: DataTypes.STRING(50), allowNull: false },
  price: { type: DataTypes.DECIMAL(16, 8), allowNull: false },
  quantity: { type: DataTypes.DECIMAL(16, 8), allowNull: true },
  stream: { type: DataTypes.STRING(50), allowNull: false },
  timestamp: { type: DataTypes.DATE(6), allowNull: false }
}, {
  sequelize,
  modelName: 'History'
});

module.exports = {
  History
};
