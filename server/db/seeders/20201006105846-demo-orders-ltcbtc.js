'use strict';

const ticker = 'LTCBTC';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const signalId = await queryInterface.rawSelect('Signals', { where: { ticker } }, ['id']);

    if (!signalId) {
      throw new Error(`Signal not found by ticker ${ticker}`);
    }

    const entryPoints = [
      { price: 0.004832, volume: 0.30 },
      { price: 0.004743, volume: 0.40 },
      { price: 0.004654, volume: 0.30 }
    ].map(({ price, volume }, index) => ({
      signalId,
      price,
      volume,
      type: 'take profit',
      comment: `TP #${index} at price ${price}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    return queryInterface.bulkInsert('Orders', entryPoints);
  },

  down: async (queryInterface, Sequelize) => {
    const signalId = await queryInterface.rawSelect('Signals', { where: { ticker } }, ['id']);

    if (!signalId) {
      return queryInterface.bulkDelete('Orders', { signalId }, {});
    }
  }
};
