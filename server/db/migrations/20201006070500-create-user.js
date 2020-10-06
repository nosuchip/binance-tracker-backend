module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(100), allowNull: false },
      password: { type: Sequelize.STRING(512), allowNull: false },
      active: { type: Sequelize.BOOLEAN, allowNull: false },
      confirmedAt: { type: Sequelize.DATE, allowNull: true },
      role: { type: Sequelize.ENUM('user', 'admin', 'paidUser'), defaultValue: 'user ' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};
