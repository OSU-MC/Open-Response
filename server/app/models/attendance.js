"use strict";

module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendance', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    enrollmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lectureForSectionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    joinedLecture: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    joinedLectureBy: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    softDelete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    // calculate the attendance based on triggers and store updated value here
    attendance: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
    {
      tableName: 'Attendance',
      indexes: [
        {
          unique: true,
          fields: ['enrollmentId', 'lectureForSectionId'],
        },
        {
          fields: ['lectureForSectionId'],
        },
        {
          fields: ['enrollmentId'],
        },
      ],
    });

  // Define associations here if needed
  Attendance.associate = (models) => {
    Attendance.belongsTo(models.Enrollment, {
      foreignKey: 'enrollmentId',
      onDelete: 'CASCADE',
    });

    Attendance.belongsTo(models.LectureForSection, {
      foreignKey: 'lectureForSectionId',
      onDelete: 'CASCADE',
    });
  };

  return Attendance;
};