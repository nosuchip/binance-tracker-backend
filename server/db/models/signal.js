const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database');
const { afterCreate, afterUpdate, afterDestroy } = require('@db/hooks/signal-hooks');

class Signal extends Model {
  static empty (overloads = {}) {
    return {
      status: 'active',
      profitability: 0,
      // ticker: 'BTCUSDT',
      risk: 'low',
      term: 'long',
      volume: 0,
      paid: false,
      commentsAllowed: true,
      // price: 0,
      // userId: admin.id

      ...overloads
    };
  }

  static async exists (ticker, price, overloads = {}) {
    const count = await Signal.count({
      where: {
        ticker,
        price,
        ...overloads
      }
    });

    return count !== 0;
  }
}

Signal.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  status: { type: DataTypes.ENUM('delayed', 'active', 'fired', 'cancelled'), allowNull: false },
  profitability: { type: DataTypes.DECIMAL(16, 8), allowNull: false },
  ticker: { type: DataTypes.STRING(50), allowNull: false },
  risk: { type: DataTypes.ENUM('high', 'medium', 'low'), allowNull: false },
  term: { type: DataTypes.ENUM('short', 'medium', 'long'), allowNull: false },
  volume: { type: DataTypes.DECIMAL(16, 8), allowNull: false },
  paid: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  commentsAllowed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  price: { type: DataTypes.DECIMAL(16, 8), allowNull: false }
}, {
  sequelize,
  modelName: 'Signal',
  hooks: {
    afterCreate,
    afterUpdate,
    afterDestroy
  }
});

module.exports = {
  Signal
};
