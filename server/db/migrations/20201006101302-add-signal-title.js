module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Signals', 'title', { type: Sequelize.STRING(50), allowNull: false });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Signals', 'title');
  }
};
