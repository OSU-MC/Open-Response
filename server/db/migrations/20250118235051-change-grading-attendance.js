'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
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
      lectureForSectionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'LectureForSections',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      weight: {
        type: Sequelize.DOUBLE,
        allowNull: false,
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

    // RequiredQuestionsInLectures Table
    await queryInterface.createTable('RequiredQuestionsInLectures', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
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
      questionInLectureId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'QuestionInLectures',
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
      validate: {
        notNull: {
          msg: 'a grade must have an associated lecture',
        },
      },
    });
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
    await queryInterface.addColumn('QuestionInLectures', 'totalPoints', {
      type: Sequelize.DOUBLE,
      allowNull: false,
      defaultValue: 1,
      validate: {
        notNull: {
          msg: 'QuestionInLecture must have a totalPoints',
        },
        min: {
          args: [0],
          msg: 'totalPoints cannot be less than 0',
        },
      },
    });

    // Add missing LectureForSections columns
    await queryInterface.addColumn('LectureForSections', 'closeAttendanceAt', {
      type: Sequelize.TIME,
      allowNull: false,
    });

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
      validate: {
        min: {
          args: [0],
          msg: "minAttendanceQuestions cannot be less than 0",
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

    // Drop lectureId column
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
  },

  down: async (queryInterface, Sequelize) => {
    // Drop newly added columns
    await queryInterface.removeColumn('LectureForSections', 'closeAttendanceAt');
    await queryInterface.removeColumn('LectureForSections', 'attendanceMethod');
    await queryInterface.removeColumn('LectureForSections', 'minAttendanceQuestions');
    await queryInterface.removeColumn('QuestionInLectures', 'lectureForSectionId');
    await queryInterface.removeColumn('Questions', 'lectureId');
  
    // Re-add removed columns
    await queryInterface.addColumn('QuestionInLectures', 'lectureId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Lectures',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
