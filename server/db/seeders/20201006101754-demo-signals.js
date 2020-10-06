'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const email = 'admin@demo.example';
    const adminId = await queryInterface.rawSelect('Users', {
      where: {
        email
      }
    }, ['id']);

    if (!adminId) {
      throw new Error(`Demo admin not found by email ${email}`);
    }

    return queryInterface.bulkInsert('Signals', [{
      status: 'active',
      profitability: 0,
      ticker: 'ETHBTC',
      title: 'ETH/BTC',
      type: 'long',
      risk: 'low',
      term: 'long',
      volume: 0,
      paid: false,
      commentable: true,
      userId: adminId,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      status: 'active',
      profitability: 0,
      ticker: 'XRPBTC',
      title: 'XRP/BTC',
      type: 'long',
      risk: 'low',
      term: 'long',
      volume: 0,
      paid: false,
      commentable: true,
      userId: adminId,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      status: 'active',
      profitability: 0,
      ticker: 'LTCBTC',
      title: 'LTC/BTC',
      type: 'long',
      risk: 'low',
      term: 'long',
      volume: 0,
      paid: false,
      commentable: true,
      userId: adminId,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Signals', null, {});
  }
};
