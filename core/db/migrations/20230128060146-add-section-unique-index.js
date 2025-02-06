'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint('Sections', {
      fields: ['courseId', 'number'],
      type: 'unique',
      name: 'custom_unique_section_constraint',
      onDelete: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'ALTER TABLE Sections ADD KEY `Sections_courseId_foreign_idx`(`courseId`);'
    )
    await queryInterface.removeConstraint('Sections', 'custom_unique_section_constraint')
  }
};
