'use strict'

module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define('Course', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Course name required"
                },
                notEmpty: {
                    msg: "Course name cannot be empty"
                },
                len: {
                    args: [0, 50],
                    msg: 'Course name must be less than or equal to 50 characters'
                }
            },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: {
                notEmpty: {
                    msg: "Course description, if it exists, cannot be empty"
                },
                len: {
                    args: [0, 500],
                    msg: 'Course description must be less than or equal to 500 characters'
                }
            }
        },
        published: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        softDelete: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        publishedAt: {
            type: DataTypes.DATETIME,
            allowNull: true,
            validate: {
                isPublishedIfNotNull(value) {
                    if (value !== null && !this.published) {
                        throw new Error("The 'published' field must be true if 'publishedAt' is not null.");
                    }
                }
            }
        },
    },
    {
        timestamps: true
    })

    Course.associate = (models) => {
        Course.hasMany(models.Enrollment)
        Course.hasMany(models.Section)
        Course.hasMany(models.Lecture)
    }

    return Course
}