'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Channels', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: Sequelize.STRING(100), allowNull: false },
      description: { type: Sequelize.STRING(516), allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.addColumn('Signals', 'channelId', { type: Sequelize.INTEGER, allowNull: true });

    await queryInterface.sequelize.query(`
      INSERT INTO Channels (name, createdAt, updatedAt)
      SELECT channel, createdAt, updatedAt
      FROM Signals
    `);

    await queryInterface.addConstraint('Signals', {
      fields: ['channelId'],
      type: 'FOREIGN KEY',
      name: 'FK_signal_channel_to_channels',
      references: {
        table: 'Channels',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    await queryInterface.sequelize.query(`
      UPDATE binance_dev.Signals s
      SET channelId = (SELECT id FROM binance_dev.Channels c WHERE s.channel = c.name)
    `);

    await queryInterface.removeColumn('Signals', 'channel');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Signals', 'channel', { type: Sequelize.STRING(100), allowNull: true });
    await queryInterface.sequelize.query(`
      UPDATE binance_dev.Signals s
      INNER JOIN binance_dev.Channels c ON s.channelId = c.id
      SET s.channel = c.name
    `);
    await queryInterface.removeColumn('Signals', 'channelId');
    await queryInterface.dropTable('Channels');
  }
};
