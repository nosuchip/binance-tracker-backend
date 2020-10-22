const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database');

class Channel extends Model {}

Channel.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.STRING(516), allowNull: true }
}, {
  sequelize,
  modelName: 'Channel'
});

module.exports = {
  Channel
};
