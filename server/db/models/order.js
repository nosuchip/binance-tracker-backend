const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database');

const OrderTypes = {
  TakeProfit: 'take profit',
  StopLoss: 'stop loss'
};

class Order extends Model {}

Order.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  price: { type: DataTypes.DECIMAL(16, 8), allowNull: false },
  volume: { type: DataTypes.DECIMAL(4, 3), allowNull: false },
  comment: { type: DataTypes.STRING(256), allowNull: true },
  type: { type: DataTypes.ENUM(Object.values(OrderTypes)) },
  closed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  closedVolume: { type: DataTypes.DECIMAL(4, 3), allowNull: true },
  triggerPrice: { type: DataTypes.DECIMAL(16, 8), allowNull: true },
  triggerDate: { type: DataTypes.DATE, allowNull: true }
}, {
  sequelize,
  modelName: 'Order'
});

module.exports = {
  Order,
  OrderTypes
};
