const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database');

class Comment extends Model {}

Comment.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  text: { type: DataTypes.STRING(2048), allowNull: false }
}, {
  sequelize,
  modelName: 'Comment'
});

module.exports = {
  Comment
};
