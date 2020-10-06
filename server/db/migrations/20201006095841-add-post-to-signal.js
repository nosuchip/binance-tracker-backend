module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Signals', 'post', { type: Sequelize.STRING(1024), allowNull: true });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Signals', 'post');
  }
};
