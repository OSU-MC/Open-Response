'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Lectures', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      title: {
          type: Sequelize.STRING(50), // max length of 50
          allowNull: false
      },
      // the order of current lecture within a course
      order: {
          type: Sequelize.INTEGER,
          allowNull: false,
      },
      description: {
        type: Sequelize.STRING(250)    // max length of 250
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('Lecture');
  }
};
