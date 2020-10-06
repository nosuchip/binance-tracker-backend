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

    await queryInterface.bulkInsert('Signals', [{
      status: 'active',
      profitability: 0,
      ticker: 'BTCUSDT',
      title: 'BTC/USDT',
      risk: 'low',
      term: 'long',
      volume: 0,
      paid: false,
      commentsAllowed: true,
      price: 10000,
      userId: adminId,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      status: 'active',
      profitability: 0,
      ticker: 'ETHUSDT',
      title: 'ETH/USDT',
      risk: 'low',
      term: 'long',
      volume: 0,
      paid: false,
      commentsAllowed: true,
      price: 360,
      userId: adminId,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      status: 'active',
      profitability: 0,
      ticker: 'XRPUSDT',
      title: 'XRP/USDT',
      risk: 'low',
      term: 'long',
      volume: 0,
      paid: false,
      commentsAllowed: true,
      price: 10000,
      userId: adminId,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      status: 'active',
      profitability: 0,
      ticker: 'LTCUSDT',
      title: 'LTC/USDT',
      risk: 'low',
      term: 'long',
      volume: 0,
      paid: false,
      commentsAllowed: true,
      price: 10000,
      userId: adminId,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Signals', null, {});
  }
};
