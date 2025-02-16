'use strict'

const moment = require('moment')

const attendanceMethods = ["join", "joinBy", "requiredQuestions"]

module.exports = (sequelize, DataTypes) => {
  const LectureForSection = sequelize.define('LectureForSection', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    sectionId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Sections',
        key: 'id'
      },
      allowNull: false,
      validate: {
        notNull: {
          msg: "Lecture For Section must have a section"
        }
      },
    },
    lectureId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Lectures',
        key: 'id'
      },
      allowNull: false,
      validate: {
        notNull: {
          msg: "Lecture For Section must have a lecture"
        }
      }
    },
    published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    closedAt: {
      type: DataTypes.DATE(6),
      allowNull: true
    },
    softDelete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    closeAttendanceAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    attendanceMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [attendanceMethods],
          msg: "Lecture For Section must have a valid attendance method"
        }
      }
    },
    // the number of questions that are required to be answered by the student if attendanceMethod="requiredQuestions"
    minAttendanceQuestions: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "Minimum attendance questions must be greater than or equal to 0"
        }
      }
    }

  },
    {
      indexes: [
        // avoids duplicate enrollments
        {
          unique: true,
          fields: ['sectionId', 'lectureId'],
          name: 'unique_lecture_section_constraint'
        }
      ],
      timestamps: true,
      hooks: {
        beforeUpdate: (lfs) => {
          if (lfs.dataValues.published === false && lfs._previousDataValues.published === true) {
            lfs.closedAt = moment().utc().format("YYYY-MM-DD HH:mm:ss")
          }
        }
      }
    })

  LectureForSection.associate = (models) => {
    LectureForSection.belongsTo(models.Section)
    LectureForSection.belongsTo(models.Lecture)
    LectureForSection.hasMany(models.QuestionInLecture)
    LectureForSection.hasMany(models.Attendance)
    LectureForSection.hasMany(models.Grades)
  }

  return LectureForSection
}
