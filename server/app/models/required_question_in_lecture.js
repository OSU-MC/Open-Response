"use strict";

module.exports = (sequelize, DataTypes) => {
  const RequiredQuestionsInLectures = sequelize.define('RequiredQuestionsInLectures', {
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

  RequiredQuestionsInLectures.associate = (models) => {
    RequiredQuestionsInLectures.belongsTo(models.Lecture, {
      foreignKey: 'lectureId',
      onDelete: 'CASCADE',
    });

    RequiredQuestionsInLectures.belongsTo(models.Question, {
      foreignKey: 'questionId',
      onDelete: 'CASCADE',
    });
  };

  return RequiredQuestionsInLectures;
};
