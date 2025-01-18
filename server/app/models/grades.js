"use strict";

// const { use } = require("../api");

// Create a table to store the grades of a student based between 0 and 1 as well as the points they've earned out of total points on all questions and tie it in relation to their user and enrollment in a course
module.exports = (sequelize, DataTypes) => {
	const Grades = sequelize.define(
		"Grades",
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: true,
				autoIncrement: true,
				primaryKey: true,
			},
			enrollmentId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "Enrollments",
					key: "id",
				},
				validate: {
					notNull: {
						msg: "a grade must have an enrollment",
					},
				},
			},
			lectureForSectionId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "LectureForSections",
					key: "id",
				},
				validate: {
					notNull: {
						msg: "a grade must have an associated lecture",
					},
				},
			},
			points: {
				type: DataTypes.INTEGER,
				allowNull: true,
				validate: {
					notNull: {
						msg: "a grade must have a score",
					},
					min: {
						args: [0],
						msg: "points cannot be less than 0",
					},
				},
			},
			totalPoints: {
				type: DataTypes.DOUBLE,
				allowNull: true,
				validate: {
					notNull: {
						msg: "a grade must have a total points",
					},
					min: {
						args: [0],
						msg: "total points cannot be less than 0",
					},
				},
			},
			softDelete: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false
			},
		},
		{
			timestamps: false,
		}
	);

	Grades.associate = (models) => {
		Grades.belongsTo(models.Enrollment, {
			foreignKey: "enrollmentId",
			onDelete: "CASCADE",
		});
		Grades.belongsTo(models.User, {
			foreignKey: "userId",
			onDelete: "CASCADE",
		});
		Grades.belongsTo(models.Section, {
			foreignKey: "sectionId",
			onDelete: "CASCADE",
		});
	};

	return Grades;
};
