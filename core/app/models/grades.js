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
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "Users",
					key: "id",
				},
				validate: {
					notNull: {
						msg: "a grade must have a user",
					},
				},
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
			sectionId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "Sections",
					key: "id",
				},
				validate: {
					notNull: {
						msg: "a grade must have a section",
					},
				},
			},
			grade: {
				type: DataTypes.DOUBLE,
				allowNull: false,
				validate: {
					notNull: {
						msg: "a grade must have a score",
					},
					min: {
						args: [0],
						msg: "score cannot be less than 0",
					},
					max: {
						args: [1],
						msg: "score cannot be more than 1",
					},
				},
			},
			points: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			totalPoints: {
				type: DataTypes.INTEGER,
				allowNull: true,
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
