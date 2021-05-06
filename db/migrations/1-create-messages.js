'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('messages', {
      channelId: {
        type: Sequelize.DataTypes.STRING
      },
      message: {
        type: Sequelize.DataTypes.STRING
      }
    });
  },
  down: async queryInterface => {
    await queryInterface.dropTable('messages');
  }
};
