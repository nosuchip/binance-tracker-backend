module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('Orders', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      signalId: { type: Sequelize.INTEGER, allowNull: false },
      price: { type: Sequelize.DECIMAL(16, 8), allowNull: false },
      volume: { type: Sequelize.DECIMAL(4, 3), allowNull: false },
      comment: { type: Sequelize.STRING(256), allowNull: true },
      type: { type: Sequelize.ENUM('take profit', 'stop loss') },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    }).then(() => queryInterface.addConstraint('Orders', {
      fields: ['signalId'],
      type: 'FOREIGN KEY',
      name: 'FK_orders_signal_to_signals',
      references: {
        table: 'Signals',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }));
  },
  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeConstraint('FK_orders_signal_to_signals');
    } catch (error) {
      // Do nothing
    }

    return queryInterface.dropTable('Orders');
  }
};
