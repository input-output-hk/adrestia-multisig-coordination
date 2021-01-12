'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('walletCosigners', {
      CosignerPubKey: {
        type: Sequelize.DataTypes.STRING,
        primaryKey: true,
        references: {
          model: {
            tableName: 'cosigners'
          },
          key: 'pubKey'
        }
      },
      WalletId: {
        type: Sequelize.DataTypes.STRING,
        primaryKey: true,
        references: {
          model: {
            tableName: 'wallets'
          },
          key: 'id'
        }
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('walletCosigners');
  }
};
