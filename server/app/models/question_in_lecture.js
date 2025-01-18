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
        lectureId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Lectures',
                key: 'id'
            },
            validate: {
                notNull: {
                    msg: 'QuestionInLecture must have a lecture'
                }
            }
        },
        order: {
            type: DataTypes.INTEGER
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
            allowNull: true,
        },
        totalPoints: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 1,
            validate: {
                notNull: {
                    msg: 'QuestionInLecture must have a totalPoints'
                },
                min: {
                    args: [0],
                    msg: 'totalPoints cannot be less than 0'
                }
            }
        }
    },
    {
        timestamps: true,
        indexes: [
            {
                name: 'custom_unique_question_in_lectures_order_constraint',
                unique: true,
                fields: ['lectureId', 'order']
            }
        ],
        hooks: {
            beforeCreate: async (questionInLecture) => {
                if (questionInLecture.order == null) {  // if lecture order isn't passed in
                    const curr_max_order = await QuestionInLecture.max('order', {     // get the current max order number for this course
                        where: {
                            lectureId: questionInLecture.lectureId
                        }
                    })
        
                    if (curr_max_order == null) {  // if no order was found (first entry for this course)
                        questionInLecture.order = 0;    // NOTE: should start off at 0, -1 is used for temporary updating purposes
                    }
                    else {  // if there is an entry for this course, get appropriate order number
                        questionInLecture.order = curr_max_order + 1
                    }
                }
            }
        }
    })

    QuestionInLecture.associate = (models) => {
        QuestionInLecture.belongsTo(models.Question)
        QuestionInLecture.belongsTo(models.LectureForSection)
        QuestionInLecture.hasMany(models.Response)
        QuestionInLecture.hasOne(models.RequiredQuestionsInLecture)
    }

    return QuestionInLecture
}