'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint('Enrollments', {
      fields: ['userId', 'courseId'],
      type: 'unique',
      name: 'custom_unique_teacher_constraint',
      onDelete: 'CASCADE'
    });
    await queryInterface.addConstraint('Enrollments', {
      fields: ['userId', 'sectionId'],
      type: 'unique',
      name: 'custom_unique_student_constraint',
      onDelete: 'CASCADE'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'ALTER TABLE Enrollments ADD KEY `Enrollments_userId_foreign_idx`(`userId`);'
    )
    await queryInterface.removeConstraint(`Enrollments`, 'custom_unique_teacher_constraint')
    await queryInterface.removeConstraint('Enrollments', 'custom_unique_student_constraint')
  }
};

/*
  Multi column unique indexes do not work in MySQL if you have a NULL value in row as MySQL treats NULL as a unique value and at least currently has no logic to work around it in multi-column indexes. Yes the behavior is insane, because it limits a lot of legitimate applications of multi-column indexes, but it is what it is... As of yet, it is a bug that has been stamped with "will not fix" on the MySQL bug-track...

  From: https://stackoverflow.com/questions/635937/how-do-i-specify-unique-constraint-for-multiple-columns-in-mysql
  */
