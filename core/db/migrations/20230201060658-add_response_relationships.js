'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Responses', 'enrollmentId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Enrollments',
        key: 'id',
        as: 'enrollmentId'
      },
      allowNull: false,
      onDelete: 'CASCADE'
    })
    await queryInterface.addColumn('Responses', 'questionInLectureId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'QuestionInLectures',
        key: 'id',
        as: 'questionInLectureId'
      },
      allowNull: false,
      onDelete: 'CASCADE'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Responses', 'enrollmentId')
    await queryInterface.removeColumn('Responses', 'questionInLectureId')
  }
};
