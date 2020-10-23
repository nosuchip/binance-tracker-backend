const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database');

class EntryPoint extends Model {};

EntryPoint.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
  price: { type: DataTypes.DECIMAL(16, 8), allowNull: false },
  comment: { type: DataTypes.STRING(256), allowNull: true },
  triggerPrice: { type: DataTypes.DECIMAL(16, 8), allowNull: true }
}, {
  sequelize,
  modelName: 'EntryPoint'
});

module.exports = {
  EntryPoint
};
