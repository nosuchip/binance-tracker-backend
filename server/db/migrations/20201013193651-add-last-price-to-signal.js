module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Signals', 'lastPrice', { type: Sequelize.DECIMAL(16, 8), allowNull: true });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Signals', 'lastPrice');
  }
};
