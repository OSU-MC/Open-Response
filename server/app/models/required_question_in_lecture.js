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
      references: {
        model: 'Lectures',
        key: 'id',
      },
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Questions',
        key: 'id',
      },
    },
  },

    {
      tableName: 'RequiredQuestionsInLectures',
      indexes: [
        {
          unique: true,
          fields: ['lectureId', 'questionId'],
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
