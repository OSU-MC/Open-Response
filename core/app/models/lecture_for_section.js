'use strict'

const moment = require('moment')

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
        averageScore: {
          type: DataTypes.DOUBLE,
          allowNull: true
        },
        participationScore: {
          type: DataTypes.DOUBLE,
          allowNull: true
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
    }

    return LectureForSection
}