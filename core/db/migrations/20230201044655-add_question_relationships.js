'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Questions', 'courseId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Courses',
        key: 'id',
        as: 'courseId'
      },
      allowNull: false,
      onDelete: 'CASCADE'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Questions', 'courseId')
  }
};
