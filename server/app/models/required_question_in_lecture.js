"use strict";

module.exports = (sequelize, DataTypes) => {
  const RequiredQuestionsInLecture = sequelize.define('RequiredQuestionsInLecture', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    lectureId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },

    {
      tableName: 'RequiredQuestionsInLectures',
      indexes: [
        {
          unique: true,
          fields: ['lectureForSectionId', 'questionInLectureId'],
        },
      ],
    });

  RequiredQuestionsInLecture.associate = (models) => {
    RequiredQuestionsInLecture.belongsTo(models.Lecture, {
      foreignKey: 'lectureId',
      onDelete: 'CASCADE',
    });

    RequiredQuestionsInLecture.belongsTo(models.Question, {
      foreignKey: 'questionId',
      onDelete: 'CASCADE',
    });
  };

  return RequiredQuestionsInLecture;
};
