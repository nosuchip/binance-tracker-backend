'use strict';

const { hashPassword } = require('../../libs/password');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const defaultHashedPassword = await hashPassword('P@ssw0rd');

    return queryInterface.bulkInsert('Users', [
      {
        name: 'Demo User',
        email: 'demo@demo.example',
        password: defaultHashedPassword,
        role: 'user',
        confirmedAt: new Date(),
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Demo Paid User',
        email: 'demo-paid@demo.example',
        password: defaultHashedPassword,
        role: 'paid user',
        confirmedAt: new Date(),
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Demo Admin',
        email: 'admin@demo.example',
        password: defaultHashedPassword,
        role: 'admin',
        confirmedAt: new Date(),
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
