"use strict";

const lecture_for_section = require("./lecture_for_section");

module.exports = (sequelize, DataTypes) => {
  const LectureGradeWeight = sequelize.define('LectureGradeWeight', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    LectureForSectionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    weight: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        min: {
          args: [0], // zero so teachers can have lectures that don't affect the grade
          msg: "Validation error: Weight must be greater than 0",
        },
      },
    },
  }, {
    tableName: 'LectureGradeWeights',
    indexes: [
      {
        unique: true,
        fields: ['LectureForSectionId'], 
      },
    ],
  });

  LectureGradeWeight.associate = (models) => {
    LectureGradeWeight.belongsTo(models.LectureForSection, {
      foreignKey: 'LectureForSectionId',
      onDelete: 'CASCADE',
    });
  };

  return LectureGradeWeight;
};
