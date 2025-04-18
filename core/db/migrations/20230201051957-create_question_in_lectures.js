'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('QuestionInLectures', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      questionId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
              model: 'Questions',
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
      order: {
          type: Sequelize.INTEGER,
          allowNull: false
      },
      published: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false
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
    })
    await queryInterface.addConstraint('QuestionInLectures', {
      fields: ['lectureId', 'order'],
      type: 'unique',
      name: 'custom_unique_question_in_lectures_order_constraint',
      onDelete: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('QuestionInLectures')
  }
};
