"use strict";

module.exports = (sequelize, DataTypes) => {
  const LectureGradeWeight = sequelize.define('LectureGradeWeight', {
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
    weight: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
  }, {
    tableName: 'LectureGradeWeights',
    indexes: [
      {
        unique: true,
        fields: ['lectureId'],
      },
    ],
  });

  LectureGradeWeight.associate = (models) => {
    LectureGradeWeight.belongsTo(models.Lecture, {
      foreignKey: 'lectureId',
      onDelete: 'CASCADE',
    });
  };

  return LectureGradeWeight;
};
