module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('Logs', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      level: { type: Sequelize.STRING(20), allowNull: false },
      message: { type: Sequelize.STRING(1024), allowNull: false },
      meta: { type: Sequelize.STRING(1024), allowNull: false },
      timestamp: { type: Sequelize.DATE, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Logs');
  }
};
