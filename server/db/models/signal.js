const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database');

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
  profitability: { type: DataTypes.DECIMAL(10, 5), allowNull: false },
  ticker: { type: DataTypes.STRING(20), allowNull: false },
  risk: { type: DataTypes.ENUM('high', 'medium', 'low'), allowNull: false },
  term: { type: DataTypes.ENUM('short', 'medium', 'long'), allowNull: false },
  volume: { type: DataTypes.DECIMAL(10, 5), allowNull: false },
  paid: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  commentsAllowed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  price: { type: DataTypes.DECIMAL(10, 5), allowNull: false }
}, {
  sequelize,
  modelName: 'Signal'
});

module.exports = {
  Signal
};
