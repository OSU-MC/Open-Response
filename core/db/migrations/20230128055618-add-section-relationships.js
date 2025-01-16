'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Sections', 'courseId', {
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
    await queryInterface.removeColumn('Sections', 'courseId')
  }
};
