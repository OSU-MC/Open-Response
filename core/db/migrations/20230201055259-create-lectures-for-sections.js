'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LectureForSections', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sectionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Sections',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      lectureId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Lectures',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      published: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      closedAt: {
        type: Sequelize.DATE(6),
        allowNull: true
      },
      averageScore: {
        type: Sequelize.DOUBLE,
        allowNull: true
      },
      participationScore: {
        type: Sequelize.DOUBLE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    await queryInterface.addConstraint('LectureForSections', {
      fields: ['lectureId', 'sectionId'],
      type: 'unique',
      name: 'unique_lecture_section_constraint',
      onDelete: 'CASCADE'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('LectureForSections');
  }
};