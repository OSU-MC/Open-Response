'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('Enrollments', 'courseId', {
          type: Sequelize.INTEGER,
          references: {
            model: 'Courses',
            key: 'id',
            as: 'courseId'
          },
          allowNull: true,
          onDelete: 'CASCADE'
        }, { transaction: t }),
        queryInterface.addColumn('Enrollments', 'sectionId', {
          type: Sequelize.INTEGER,
          references: {
            model: 'Sections',
            key: 'id',
            as: 'sectionId'
          },
          allowNull: true,
          onDelete: 'CASCADE'
        }, { transaction: t }),
        queryInterface.addColumn('Enrollments', 'userId', {
          type: Sequelize.INTEGER,
          references: {
            model: 'Users',
            key: 'id',
            as: 'userId'
          },
          allowNull: false,
          onDelete: 'CASCADE'
        }, { transaction: t })
      ]);
    });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('Enrollments', 'courseId', { transaction: t }),
        queryInterface.removeColumn('Enrollments', 'sectionId', { transaction: t }),
        queryInterface.removeColumn('Enrollments', 'userId', { transaction: t })
      ]);
    });
  }
};
