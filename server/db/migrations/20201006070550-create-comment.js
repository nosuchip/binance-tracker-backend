module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('Comments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      userId: { type: Sequelize.INTEGER, allowNull: false },
      signalId: { type: Sequelize.INTEGER, allowNull: true },
      postId: { type: Sequelize.INTEGER, allowNull: true },
      text: { type: Sequelize.STRING(2048), allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    }).then(() => queryInterface.addConstraint('Comments', {
      fields: ['userId'],
      type: 'FOREIGN KEY',
      name: 'FK_comment_author_to_users',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    })).then(() => queryInterface.addConstraint('Comments', {
      fields: ['signalId'],
      type: 'FOREIGN KEY',
      name: 'FK_comment_signal_to_signals',
      references: {
        table: 'Signals',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    })).then(() => queryInterface.addConstraint('Comments', {
      fields: ['postId'],
      type: 'FOREIGN KEY',
      name: 'FK_comment_post_to_posts',
      references: {
        table: 'Posts',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    }));
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeConstraint('FK_comment_author_to_users');
      await queryInterface.removeConstraint('FK_comment_signal_to_signals');
      await queryInterface.removeConstraint('FK_comment_post_to_posts');
    } catch (error) {
      // Do nothing
    }

    return queryInterface.dropTable('Comments');
  }
};
