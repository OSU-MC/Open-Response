'use strict'

module.exports = (sequelize, DataTypes) => {
    const Lecture = sequelize.define('Lecture', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        courseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Courses',
                key: 'id'
            },
            validate: {
                notNull: {
                    msg: "Lecture must have a course"
                }
            }
        },
        title: {
            type: DataTypes.STRING(50), // max length of 50
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Lecture name required'
                },
                len: {
                    args: [1, 50],
                    msg: 'Title must be between 1 and 50 characters'
                }
            }
        },
        // the order of current lecture within a course
        //      the order column is non-nullable in the database, but we do not want sequelize to perform notNull validation
        //      because the beforeCreate action defined below will auto-set the order within the scope of the course
        order: {
            type: DataTypes.INTEGER
        },
        description: {
            type: DataTypes.STRING(250),    // max length of 250
            validate: {
                len: {
                    args: [0, 250],
                    msg: 'Description must be less than 250 characters'
                }
            }
        },
    },
    {
        hooks: {
            beforeCreate: async (lecture) => {
                if (lecture.order == null) {  // if lecture order isn't passed in
                    const curr_max_order = await Lecture.max('order', {     // get the current max order number for this course
                        where: {
                            courseId: lecture.courseId
                        }
                    })
    
                    if (curr_max_order == null) {  // if no order was found (first entry for this course)
                        lecture.order = 0;
                    }
                    else {  // if there is an entry for this course, get appropriate order number
                        lecture.order = curr_max_order + 1
                    }
                }
            }
        },
        indexes: [
            {
                name: 'custom_unique_lecture_constraint',
                unique: true,
                fields: ['order', 'courseId']
            }
        ],
        timestamps: true
    })

    Lecture.associate = (models) => {
        Lecture.belongsTo(models.Course)
        Lecture.hasMany(models.QuestionInLecture)
        Lecture.hasMany(models.LectureForSection)
    }

    return Lecture;
}