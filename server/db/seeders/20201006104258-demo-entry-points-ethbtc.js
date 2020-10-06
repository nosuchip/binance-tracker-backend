'use strict';

const ticker = 'ETHBTC';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const signalId = await queryInterface.rawSelect('Signals', { where: { ticker } }, ['id']);

    if (!signalId) {
      throw new Error(`Signal not found by ticker ${ticker}`);
    }

    const entryPoints = [0.033000, 0.032000, 0.031000].map((price, index) => ({
      signalId,
      price,
      comment: `Entry point #${index} at price ${price}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    return queryInterface.bulkInsert('EntryPoints', entryPoints);
  },

  down: async (queryInterface, Sequelize) => {
    const signalId = await queryInterface.rawSelect('Signals', { where: { ticker } }, ['id']);

    if (!signalId) {
      return queryInterface.bulkDelete('EntryPoints', { signalId }, {});
    }
  }
};
