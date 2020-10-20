module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    await Promise.all([
      queryInterface.changeColumn('Signals', 'profitability', { type: Sequelize.DECIMAL(16, 8), allowNull: true }, { transaction }),
      queryInterface.renameColumn('Signals', 'profitability', 'exitPrice', { transaction })
    ]);

    return queryInterface.addColumn('Signals', 'profitability', { type: Sequelize.DECIMAL(16, 8), allowNull: false });
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    await Promise.all([
      queryInterface.removeColumn('Signals', 'profitability'),
      queryInterface.changeColumn('Signals', 'exitPrice', { type: Sequelize.DECIMAL(16, 8), allowNull: false, default: 0 }, { transaction })
    ]);

    return queryInterface.renameColumn('Signals', 'exitPrice', 'profitability', { transaction });
  }
};
