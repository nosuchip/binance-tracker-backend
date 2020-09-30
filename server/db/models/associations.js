const { User } = require('./user');
const { Signal } = require('./signal');
const { Post } = require('./post');
const { Comment } = require('./comment');

const associate = async () => {
  Signal.belongsTo(User, {
    onDelete: 'SET NULL',
    foreignKey: {
      name: 'userId',
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

  Comment.belongsTo(Signal, {
    as: 'signal',
    foreignKey: {
      name: 'signalId'
    }
  });
};

module.exports = {
  associate
};
