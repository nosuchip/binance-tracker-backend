const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database');

class Order extends Model {}

Order.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  price: { type: DataTypes.DECIMAL(16, 8), allowNull: false },
  volume: { type: DataTypes.DECIMAL(4, 3), allowNull: false },
  comment: { type: DataTypes.STRING(256), allowNull: true },
  type: { type: DataTypes.ENUM('take profit', 'stop loss') }
}, {
  sequelize,
  modelName: 'Order'
});

module.exports = {
  Order
};
