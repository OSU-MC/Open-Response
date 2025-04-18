'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
        return queryInterface.removeColumn('Enrollments', 'role', { transaction: t }).then(() => {
          return queryInterface.addColumn('Enrollments', 'role', {
            type: Sequelize.ENUM('student', 'teacher', 'ta'),
            allowNull: false,
          }, { transaction: t })
        })
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
        return queryInterface.removeColumn('Enrollments', 'role', { transaction: t }).then(() => {
          return queryInterface.addColumn('Enrollments', 'role', {
            type: Sequelize.STRING,
            allowNull: false
          }, { transaction: t })
        })
    })
  }
};
