module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Signals', 'profitability', { type: Sequelize.DECIMAL(16, 8), allowNull: true });
    await queryInterface.renameColumn('Signals', 'profitability', 'exitPrice');
    await queryInterface.addColumn('Signals', 'profitability', { type: Sequelize.DECIMAL(16, 8), allowNull: false });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Signals', 'profitability');
    await queryInterface.changeColumn('Signals', 'exitPrice', { type: Sequelize.DECIMAL(16, 8), allowNull: false, default: 0 });
    await queryInterface.renameColumn('Signals', 'exitPrice', 'profitability');
  }
};
