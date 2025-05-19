'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove lectureId column if it exists
    const table = await queryInterface.describeTable('LectureGradeWeights');
    if (table.lectureId) {
      await queryInterface.removeColumn('LectureGradeWeights', 'lectureId');
    }

    // Remove index on lectureId if it exists
    try {
      await queryInterface.removeIndex('LectureGradeWeights', 'lectureId');
    } catch (e) {
      // Index may not exist, ignore error
    }

    await queryInterface.addIndex('LectureGradeWeights', ['lectureForSectionId'], {
      name: 'lectureForSectionId',
      unique: false,
    });

    // Change the weight column to allow minimum value 0
    await queryInterface.changeColumn('LectureGradeWeights', 'weight', {
      type: Sequelize.DOUBLE,
      allowNull: false,
    });

    // Add a DB-level check constraint to ensure weight >= 0 (MySQL syntax)
    await queryInterface.sequelize.query(
      'ALTER TABLE `LectureGradeWeights` ADD CONSTRAINT weight_nonnegative CHECK (weight >= 0)'
    );
  },

  async down(queryInterface, Sequelize) {
    // Remove the index on lectureForSectionId
    await queryInterface.removeIndex('LectureGradeWeights', 'lectureForSectionId');
    // Remove the DB-level check constraint (MySQL syntax)
    await queryInterface.sequelize.query(
      'ALTER TABLE `LectureGradeWeights` DROP CONSTRAINT weight_nonnegative'
    );
  }
};