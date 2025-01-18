"use strict";

module.exports = (sequelize, DataTypes) => {
  const RequiredQuestionsInLectures = sequelize.define('RequiredQuestionsInLectures', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    lectureForSectionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    questionInLectureId: {
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

  RequiredQuestionsInLectures.associate = (models) => {
    RequiredQuestionsInLectures.belongsTo(models.LectureForSection, {
      foreignKey: 'lectureForSectionId',
      onDelete: 'CASCADE',
    });

    RequiredQuestionsInLectures.belongsTo(models.QuestionInLecture, {
      foreignKey: 'questionInLectureId',
      onDelete: 'CASCADE',
    });
  };

  return RequiredQuestionsInLectures;
};
