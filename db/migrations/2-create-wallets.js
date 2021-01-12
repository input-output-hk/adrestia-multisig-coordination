'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('wallets', {
      id: {
        type: Sequelize.DataTypes.STRING,
        primaryKey: true
      },
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      m: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      n: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
      },
      initiatorPubKey: {
        type: Sequelize.DataTypes.STRING,
        references: {
          model: {
            tableName: 'cosigners'
          },
          key: 'pubKey'
        }
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('wallets');
  }
};
