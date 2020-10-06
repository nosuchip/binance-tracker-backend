'use strict';

const ticker = 'XRPBTC';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const signalId = await queryInterface.rawSelect('Signals', { where: { ticker } }, ['id']);

    if (!signalId) {
      throw new Error(`Signal not found by ticker ${ticker}`);
    }

    const entryPoints = [0.00002382, 0.00002376, 0.00002370].map((price, index) => ({
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
