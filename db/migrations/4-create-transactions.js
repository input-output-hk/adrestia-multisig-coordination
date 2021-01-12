'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.DataTypes.STRING,
        primaryKey: true
      },
      unsignedTransaction: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      walletId: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        references: {
          model: {
            tableName: 'wallets'
          },
          key: 'id'
        }
      },
      issuerPubKey: {
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
    await queryInterface.dropTable('transactions');
  }
};
