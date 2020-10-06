module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('EntryPoints', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      signalId: { type: Sequelize.INTEGER, allowNull: false },
      price: { type: Sequelize.DECIMAL(16, 8), allowNull: false },
      comment: { type: Sequelize.STRING(256), allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    }).then(() => queryInterface.addConstraint('EntryPoints', {
      fields: ['signalId'],
      type: 'FOREIGN KEY',
      name: 'FK_entrypoints_signal_to_signals',
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
      await queryInterface.removeConstraint('FK_entrypoints_signal_to_signals');
    } catch (error) {
      // Do nothing
    }

    return queryInterface.dropTable('EntryPoints');
  }
};
