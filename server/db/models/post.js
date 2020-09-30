const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database');

class Post extends Model {}

Post.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  text: { type: DataTypes.STRING(2048), allowNull: false }
}, {
  sequelize,
  modelName: 'Post'
});

module.exports = {
  Post
};
