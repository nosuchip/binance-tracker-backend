module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    return Promise.all([
      queryInterface.addColumn('Orders', 'triggerPrice', { type: Sequelize.DECIMAL(16, 8), allowNull: true }, { transaction }),
      queryInterface.addColumn('Orders', 'triggerDate', { type: Sequelize.DATE, allowNull: true }, { transaction }),
      queryInterface.addColumn('EntryPoints', 'triggerPrice', { type: Sequelize.DECIMAL(16, 8), allowNull: true }, { transaction }),
      queryInterface.addColumn('EntryPoints', 'triggerDate', { type: Sequelize.DATE, allowNull: true }, { transaction })
    ])
      .then(() => transaction.commit())
      .catch(() => transaction.rollback());
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    return Promise.all([
      queryInterface.removeColumn('Orders', 'triggerPrice'),
      queryInterface.removeColumn('Orders', 'triggerDate'),
      queryInterface.removeColumn('EntryPoints', 'triggerPrice'),
      queryInterface.removeColumn('EntryPoints', 'triggerDate')
    ])
      .then(() => transaction.commit())
      .catch(() => transaction.rollback());
  }
};
