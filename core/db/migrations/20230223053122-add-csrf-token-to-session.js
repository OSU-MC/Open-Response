'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.addColumn('Sessions', 'csrfToken', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Sessions', 'csrfToken')
  }
};
