const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database');

class User extends Model {
}

User.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false },
  password: { type: DataTypes.STRING(512), allowNull: false },
  active: { type: DataTypes.BOOLEAN, allowNull: false },
  confirmedAt: { type: DataTypes.DATE, allowNull: true },
  role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user ' }
}, {
  sequelize,
  modelName: 'User'
});

module.exports = {
  User
};
