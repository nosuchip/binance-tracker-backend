const { User } = require('./user');
const { Signal } = require('./signal');
const { Post } = require('./post');
const { Comment } = require('./comment');
const { EntryPoint } = require('./entrypoint');
const { Order } = require('./order');

const associate = async () => {
  Signal.belongsTo(User, {
    onDelete: 'SET NULL',
    foreignKey: {
      name: 'userId',
      allowNull: true
    }
  });

  Signal.hasMany(EntryPoint, {
    onDelete: 'CASCADE',
    foreignKey: {
      name: 'signalId',
      allowNull: false
    }
  });

  Signal.hasMany(Order, {
    onDelete: 'CASCADE',
    foreignKey: {
      name: 'signalId',
      allowNull: false
    }
  });

  Signal.hasMany(Comment, {
    onDelete: 'CASCADE',
    foreignKey: {
      name: 'signalId',
      allowNull: true
    }
  });

  Post.belongsTo(User, {
    as: 'author',
    onDelete: 'SET NULL',
    foreignKey: {
      name: 'userId',
      allowNull: true
    }
  });

  Comment.belongsTo(Post, {
    as: 'post',
    foreignKey: {
      name: 'postId'
    }
  });

  Comment.belongsTo(User, {
    as: 'author',
    onDelete: 'CASCADE',
    foreignKey: {
      name: 'userId',
      allowNull: false
    }
  });
};

module.exports = {
  associate
};
