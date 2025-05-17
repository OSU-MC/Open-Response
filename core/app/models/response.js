"use strict";

module.exports = (sequelize, DataTypes) => {
	const Response = sequelize.define(
		"Response",
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
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
						msg: "a response must have an enrollment",
					},
				},
			},
			questionInLectureId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "QuestionInLectures",
					key: "id",
				},
				validate: {
					notNull: {
						msg: "a response must have question in a lecture",
					},
				},
			},
			score: {
				type: DataTypes.DOUBLE,
				allowNull: false,
				validate: {
					notNull: {
						msg: "a response must have a score",
					},
					min: {
						args: [0],
						msg: "score cannot be less than 0",
					}
				},
			},
			// the submission object is what was sent in the POST/PUT request body from the frontend. It should store the answers, for example
			submission: {
				type: DataTypes.JSON,
				defaultValue: {},
			},
			softDelete: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false
			},
		},
		{
			timestamps: true,
		}
	);

	Response.associate = (models) => {
		Response.belongsTo(models.Enrollment);
		Response.belongsTo(models.QuestionInLecture);
	};

	return Response;
};
