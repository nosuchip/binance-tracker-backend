module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('Posts', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      userId: { type: Sequelize.INTEGER, allowNull: true },
      title: { type: Sequelize.STRING(200), allowNull: false },
      text: { type: Sequelize.STRING(2048), allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    }).then(() => queryInterface.addConstraint('Posts', {
      fields: ['userId'],
      type: 'FOREIGN KEY',
      name: 'FK_post_author_to_users',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }));
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeConstraint('FK_post_author_to_users');
    } catch (error) {
      // Do nothing
    }

    return queryInterface.dropTable('Posts');
  }
};
