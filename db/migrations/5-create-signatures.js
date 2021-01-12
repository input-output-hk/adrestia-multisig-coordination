'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('signatures', {
      id: {
        type: Sequelize.DataTypes.STRING,
        primaryKey: true
      },
      transactionId: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        references: {
          model: {
            tableName: 'transactions'
          },
          key: 'id'
        }
      },
      cosignerPubKey: {
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
    await queryInterface.dropTable('signatures');
  }
};
