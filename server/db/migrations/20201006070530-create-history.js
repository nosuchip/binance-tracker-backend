module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('Histories', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      ticker: { type: Sequelize.STRING(50), allowNull: false },
      price: { type: Sequelize.DECIMAL(16, 8), allowNull: false },
      quantity: { type: Sequelize.DECIMAL(16, 8), allowNull: true },
      stream: { type: Sequelize.STRING(50), allowNull: false },
      timestamp: { type: Sequelize.DATE(6), allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Histories');
  }
};
