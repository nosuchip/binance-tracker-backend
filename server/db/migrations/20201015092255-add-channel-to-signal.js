module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Signals', 'channel', { type: Sequelize.STRING(100), allowNull: true });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Signals', 'channel');
  }
};
