"use strict";

module.exports = (sequelize, DataTypes) => {
  const LectureGradeWeights = sequelize.define('LectureGradeWeights', {
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
    weight: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
  }, {
    tableName: 'LectureGradeWeights',
    indexes: [
      {
        unique: true,
        fields: ['lectureForSectionId'],
      },
    ],
  });

  LectureGradeWeights.associate = (models) => {
    LectureGradeWeights.belongsTo(models.LectureForSection, {
      foreignKey: 'lectureForSectionId',
      onDelete: 'CASCADE',
    });
  };

  return LectureGradeWeights;
};
