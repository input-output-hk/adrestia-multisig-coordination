'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cosigners', {
      pubKey: {
        type: Sequelize.DataTypes.STRING,
        primaryKey: true
      },
      alias: {
        type: Sequelize.DataTypes.STRING
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('wallets');
  }
};
