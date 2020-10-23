const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database');

class Log extends Model {
  static async log (level, message, meta = {}) {
    const data = { level, message, meta: JSON.stringify(meta), timestamp: new Date() };
    return Log.create(data);
  }
}

Log.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
  level: { type: DataTypes.STRING(20), allowNull: false },
  message: { type: DataTypes.STRING(1024), allowNull: false },
  meta: { type: DataTypes.STRING(1024), allowNull: false },
  timestamp: { type: DataTypes.DATE, allowNull: false }
}, {
  sequelize,
  modelName: 'Log'
});

module.exports = {
  Log
};
