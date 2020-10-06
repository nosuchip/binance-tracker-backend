module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('Signals', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      userId: { type: Sequelize.INTEGER, allowNull: true },
      status: { type: Sequelize.ENUM('delayed', 'active', 'fired', 'cancelled'), allowNull: false },
      profitability: { type: Sequelize.DECIMAL(16, 8), allowNull: false },
      ticker: { type: Sequelize.STRING(50), allowNull: false },
      title: { type: Sequelize.STRING(50), allowNull: false },
      type: { type: Sequelize.ENUM('short', 'long'), allowNull: false },
      risk: { type: Sequelize.ENUM('high', 'medium', 'low'), allowNull: false },
      term: { type: Sequelize.ENUM('short', 'medium', 'long'), allowNull: false },
      volume: { type: Sequelize.DECIMAL(16, 8), allowNull: false },
      paid: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      commentable: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    }).then(() => queryInterface.addConstraint('Signals', {
      fields: ['userId'],
      type: 'FOREIGN KEY',
      name: 'FK_signal_author_to_users',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    }));
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeConstraint('FK_signal_author_to_users');
    } catch (error) {
      // Do nothing
    }
    return queryInterface.dropTable('Signals');
  }
};
