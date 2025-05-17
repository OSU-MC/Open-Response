'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

      // Attendance Table
      await queryInterface.createTable('Attendance', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        enrollmentId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Enrollments',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        lectureForSectionId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'LectureForSections',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        joinedLecture: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        joinedLectureBy: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        softDelete: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        attendance: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      });

      // LectureGradeWeights Table
      await queryInterface.createTable('LectureGradeWeights', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        lectureId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Lectures',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        weight: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          validate: {
            min: {
              args: [0.000000001],
              msg: 'Validation error: Weight must be greater than 0',
            },
          },
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        }
      });

      // RequiredQuestionsInLectures Table
      await queryInterface.createTable('RequiredQuestionsInLectures', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        lectureId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Lectures',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        questionId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Questions',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      // Modify Response Table
      await queryInterface.removeColumn('Responses', 'points');
      await queryInterface.removeColumn('Responses', 'totalPoints');

      // Modify Grades Table
      await queryInterface.addColumn('Grades', 'lectureForSectionId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'LectureForSections',
          key: 'id',
        },
        onDelete: 'CASCADE',
        validate: {
          notNull: {
            msg: 'a grade must have an associated lecture',
          },
        },
      });
      await queryInterface.removeColumn('Grades', 'sectionId');
      await queryInterface.changeColumn('Grades', 'points', {
        type: Sequelize.DOUBLE,
        allowNull: true,
        validate: {
          notNull: {
            msg: 'a grade must have a score',
          },
          min: {
            args: [0],
            msg: 'points cannot be less than 0',
          },
        },
      });
      await queryInterface.removeColumn('Grades', 'grade');
      await queryInterface.changeColumn('Grades', 'totalPoints', {
        type: Sequelize.DOUBLE,
        allowNull: true,
        validate: {
          notNull: {
            msg: 'a grade must have a total points',
          },
          min: {
            args: [0],
            msg: 'total points cannot be less than 0',
          },
        },
      });

      // Modify QuestionInLecture Table
      await queryInterface.addColumn('Questions', 'totalPoints', {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 1,
        validate: {
          notNull: {
            msg: 'Question must have a totalPoints',
          },
          min: {
            args: [0],
            msg: 'totalPoints cannot be less than 0',
          },
        },
      });

      await queryInterface.addColumn('QuestionInLectures', 'lectureForSectionId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'LectureForSections',
          key: 'id',
        },
        onDelete: 'CASCADE',
      });

      // Move order from QuestionInLectures to Questions
      await queryInterface.addColumn('Questions', 'order', {
        type: Sequelize.INTEGER,
        defaultValue: -1, // -1 is used when it is not sorted
        allowNull: false,
      });
      await queryInterface.removeColumn('QuestionInLectures', 'order');

      // Add the new unique constraint on `lectureForSectionId` and `questionId`
      await queryInterface.addConstraint('QuestionInLectures', {
        fields: ['lectureForSectionId', 'questionId'],
        type: 'unique',
        name: 'custom_unique_question_in_lectures_question_constraint'
      });
      await queryInterface.sequelize.query(`
        ALTER TABLE QuestionInLectures DROP FOREIGN KEY QuestionInLectures_ibfk_1;
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE QuestionInLectures DROP FOREIGN KEY QuestionInLectures_ibfk_2;
      `);
      // Remove the old unique constraint on `lectureId` and `order`
      await queryInterface.removeConstraint(
        'QuestionInLectures',
        'custom_unique_question_in_lectures_order_constraint'
      );

      // Add missing LectureForSections columns
      await queryInterface.addColumn('LectureForSections', 'closeAttendanceAt', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      });

      // Add missing LectureForSections columns
      await queryInterface.addColumn('LectureForSections', 'attendanceMethod', {
        type: Sequelize.ENUM("join", "joinBy", "requiredQuestions"),
        allowNull: false,
        defaultValue: "join",
        validate: {
          isIn: {
            args: [["join", "joinBy", "requiredQuestions"]],
            msg: "attendanceMethod must be one of 'join', 'joinBy', or 'requiredQuestions'",
          },
        },
      });

      await queryInterface.addColumn('LectureForSections', 'minAttendanceQuestions', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
          min: {
            args: [0],
            msg: "minAttendanceQuestions cannot be less than 0",
          },
        },
      });

      // Drop lectureId column
      await queryInterface.addConstraint('QuestionInLectures', {
        fields: ['questionId'],
        type: 'foreign key',
        name: 'QuestionInLectures_ibfk_1',
        references: {
          table: 'Questions',
          field: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      await queryInterface.addConstraint('QuestionInLectures', {
        fields: ['lectureForSectionId'],
        type: 'foreign key',
        name: 'QuestionInLectures_ibfk_2',
        references: {
          table: 'LectureForSections',
          field: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      await queryInterface.removeConstraint('QuestionInLectures', 'QuestionInLectures_ibfk_1');
      await queryInterface.removeConstraint('QuestionInLectures', 'QuestionInLectures_ibfk_2');
      await queryInterface.removeColumn('QuestionInLectures', 'lectureId');
      await queryInterface.addColumn('Questions', 'lectureId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Lectures',
          key: 'id',
        },
        onDelete: 'CASCADE',
      });

      // Drop courseId column
      await queryInterface.removeColumn('Questions', 'courseId');
    } finally {
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Drop newly added columns
    await queryInterface.removeColumn('LectureForSections', 'closeAttendanceAt');
    await queryInterface.removeColumn('LectureForSections', 'attendanceMethod');
    await queryInterface.removeColumn('LectureForSections', 'minAttendanceQuestions');
    await queryInterface.removeColumn('QuestionInLectures', 'lectureForSectionId');
    await queryInterface.removeColumn('Questions', 'lectureId');

    // Re-add removed columns
    await queryInterface.addConstraint('QuestionInLectures', {
      fields: ['questionId'],
      type: 'foreign key',
      name: 'QuestionInLectures_ibfk_1',
      references: {
        table: 'Questions',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    await queryInterface.addConstraint('QuestionInLectures', {
      fields: ['lectureId'],
      type: 'foreign key',
      name: 'QuestionInLectures_ibfk_2',
      references: {
        table: 'Lectures',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    await queryInterface.removeConstraint('QuestionInLectures', 'QuestionInLectures_ibfk_1');
    await queryInterface.removeConstraint('QuestionInLectures', 'QuestionInLectures_ibfk_2');
    await queryInterface.addColumn('QuestionInLectures', 'lectureId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Lectures',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addColumn('Questions', 'courseId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Courses',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });

    // Revert changes to `Grades` table
    await queryInterface.removeColumn('Grades', 'lectureForSectionId');
    await queryInterface.addColumn('Grades', 'sectionId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Sections',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });
    await queryInterface.addColumn('Grades', 'grade', {
      type: Sequelize.DOUBLE,
      allowNull: true,
    });
    await queryInterface.changeColumn('Grades', 'points', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.changeColumn('Grades', 'totalPoints', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Revert changes to `Questions` table
    await queryInterface.removeColumn('Questions', 'order');
    await queryInterface.addColumn('QuestionInLectures', 'order', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // Re-add the old unique constraint on `lectureId` and `order`
    await queryInterface.addConstraint('QuestionInLectures', {
      fields: ['lectureId', 'order'],
      type: 'unique',
      name: 'custom_unique_question_in_lectures_order_constraint'
    });
    await queryInterface.sequelize.query(`
      ALTER TABLE QuestionInLectures DROP FOREIGN KEY QuestionInLectures_ibfk_1;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE QuestionInLectures DROP FOREIGN KEY QuestionInLectures_ibfk_2;
    `);
    // Remove the new unique constraint on `lectureForSectionId` and `questionId`
    await queryInterface.removeConstraint(
      'QuestionInLectures',
      'custom_unique_question_in_lectures_question_constraint'
    );

    await queryInterface.removeColumn('Questions', 'totalPoints');
    await queryInterface.addColumn('QuestionInLecture', 'totalPoints', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Revert changes to `Responses` table
    await queryInterface.addColumn('Responses', 'points', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('Responses', 'totalPoints', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Revert changes to `QuestionInLectures` table
    await queryInterface.removeColumn('QuestionInLectures', 'totalPoints');

    // Drop newly created tables
    await queryInterface.dropTable('Attendance');
    await queryInterface.dropTable('LectureGradeWeights');
    await queryInterface.dropTable('RequiredQuestionsInLectures');
  },
};