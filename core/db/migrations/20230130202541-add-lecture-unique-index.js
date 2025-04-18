'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint('Lectures', {
      fields: ['courseId', 'order'],
      type: 'unique',
      name: 'custom_unique_lecture_constraint',
      onDelete: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'ALTER TABLE Lectures ADD KEY `Lectures_courseId_foreign_idx`(`courseId`);'
    )
    await queryInterface.removeConstraint('Lectures', 'custom_unique_lecture_constraint')
  }
};
