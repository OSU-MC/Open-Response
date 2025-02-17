'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
      return queryInterface.sequelize.transaction(t => {
        return Promise.all([
          queryInterface.addColumn('Users', 'emailConfirmationCode', {
            type: Sequelize.DataTypes.STRING
          }, { transaction: t }),
          queryInterface.addColumn('Users', 'emailConfirmationExpiresAt', {
            type: Sequelize.DataTypes.DATE,
          }, { transaction: t }),
          queryInterface.addColumn('Users', 'passwordResetCode', {
            type: Sequelize.DataTypes.STRING,
          }, { transaction: t }),
          queryInterface.addColumn('Users', 'passwordResetExpiresAt', {
            type: Sequelize.DataTypes.DATE,
          }, { transaction: t }),
          queryInterface.addColumn('Users', 'passwordResetInitiated', {
            type: Sequelize.DataTypes.BOOLEAN,
          }, { transaction: t })
        ]);
      });
    },
    async down (queryInterface, Sequelize) {
      return queryInterface.sequelize.transaction(t => {
        return Promise.all([
          queryInterface.removeColumn('Users', 'emailConfirmationCode', { transaction: t }),
          queryInterface.removeColumn('Users', 'emailConfirmationExpiresAt', { transaction: t }),
          queryInterface.removeColumn('Users', 'passwordResetCode', { transaction: t }),
          queryInterface.removeColumn('Users', 'passwordResetExpiresAt', { transaction: t }),
          queryInterface.removeColumn('Users', 'passwordResetInitiated', { transaction: t })
        ]);
      });
    }
  };