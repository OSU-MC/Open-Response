'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    // Add softDelete to relevant models
    await queryInterface.addColumn('Courses', 'softDelete', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('Enrollments', 'softDelete', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('Enrollments', 'softUnenroll', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('Grades', 'softDelete', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('Lectures', 'softDelete', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('Lectures', 'archived', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('LectureForSections', 'softDelete', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('LectureForSections', 'publishedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Questions', 'softDelete', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('QuestionInLectures', 'softDelete', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('QuestionInLectures', 'publishedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Responses', 'softDelete', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('Sections', 'softDelete', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('Users', 'softDelete', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    // Remove softDelete and other new fields from relevant models
    await queryInterface.removeColumn('Courses', 'softDelete');
    await queryInterface.removeColumn('Enrollments', 'softDelete');
    await queryInterface.removeColumn('Enrollments', 'softUnenroll');
    await queryInterface.removeColumn('Grades', 'softDelete');
    await queryInterface.removeColumn('Lectures', 'softDelete');
    await queryInterface.removeColumn('Lectures', 'archived');
    await queryInterface.removeColumn('LectureForSections', 'softDelete');
    await queryInterface.removeColumn('LectureForSections', 'publishedAt');
    await queryInterface.removeColumn('Questions', 'softDelete');
    await queryInterface.removeColumn('QuestionInLectures', 'softDelete');
    await queryInterface.removeColumn('QuestionInLectures', 'publishedAt');
    await queryInterface.removeColumn('Responses', 'softDelete');
    await queryInterface.removeColumn('Sections', 'softDelete');
    await queryInterface.removeColumn('Users', 'softDelete');
  }
};
