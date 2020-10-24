module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    return Promise.all([
      queryInterface.addColumn('Orders', 'triggerPrice', { type: Sequelize.DATE, allowNull: true }, { transaction }),
      queryInterface.addColumn('EntryPoints', 'triggerPrice', { type: Sequelize.DATE, allowNull: true }, { transaction })
    ])
      .then(() => transaction.commit())
      .catch(() => transaction.rollback());
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    return Promise.all([
      queryInterface.removeColumn('Orders', 'triggerPrice'),
      queryInterface.removeColumn('EntryPoints', 'triggerPrice')
    ])
      .then(() => transaction.commit())
      .catch(() => transaction.rollback());
  }
};
