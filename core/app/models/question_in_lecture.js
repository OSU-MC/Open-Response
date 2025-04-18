'use strict'

module.exports = (sequelize, DataTypes) => {
    const QuestionInLecture = sequelize.define('QuestionInLecture', {
        // the id column should be standardized across all models
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        questionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Questions',
                key: 'id'
            },
            validate: {
                notNull: {
                    msg: 'QuestionInLecture must have a question'
                }
            }
        },
        lectureForSectionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'LectureForSections',
                key: 'id'
            },
            validate: {
                notNull: {
                    msg: 'QuestionInLecture must have a LectureForSection'
                }
            }
        },
        published: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        softDelete: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        publishedAt: {
            type: DataTypes.DATE,
            defaultValue: null
        },
    },
    {
        timestamps: true,
        indexes: [
            {
                name: 'custom_unique_question_in_lectures_question_constraint',
                unique: true,
                fields: ['lectureForSectionId', 'questionId',]
            }
        ],
    })

    QuestionInLecture.associate = (models) => {
        QuestionInLecture.belongsTo(models.Question)
        QuestionInLecture.belongsTo(models.LectureForSection,
           { foreignKey: 'lectureForSectionId'});
        QuestionInLecture.hasMany(models.Response)
        QuestionInLecture.hasOne(models.RequiredQuestionsInLecture)
    }

    return QuestionInLecture
}