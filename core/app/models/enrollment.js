"use strict";

module.exports = (sequelize, DataTypes) => {
	const Enrollment = sequelize.define(
		"Enrollment",
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			role: {
				// ENUM datatypes are stored and queried more efficiently because MySQL maps the strings to integers on the backside of things
				type: DataTypes.ENUM("student", "teacher", "ta"),
				allowNull: false,
				validate: {
					isIn: [["student", "teacher", "ta"]],
					notNull: {
						msg: "Enrollment role required",
					},
				},
			},
			courseId: {
				type: DataTypes.INTEGER,
				references: {
					model: "Courses",
					key: "id",
				},
				allowNull: true,
				validate: {
					roleValidation(courseId) {
						if (courseId == null || courseId == undefined) {
							// a teacher must have a course
							if (this.role === "teacher") {
								throw new Error("Teacher must be enrolled in a course");
							}
						} else {
							// section cannot also be set
							if (!(this.sectionId == null)) {
								throw new Error(
									"Enrollment cannot be in a section and a course"
								);
							}

							// only a teacher is enrolled in a course
							if (!(this.role === "teacher")) {
								throw new Error(
									"Only a teacher can be enrolled at the course level"
								);
							}
						}
					},
				},
			},
			userId: {
				type: DataTypes.INTEGER,
				references: {
					model: "Users",
					key: "id",
				},
				allowNull: false,
				validate: {
					notNull: {
						msg: "Enrollment must have a user",
					},
				},
			},
			sectionId: {
				type: DataTypes.INTEGER,
				references: {
					model: "Sections",
					key: "id",
				},
				allowNull: true,
				validate: {
					roleValidation(sectionId) {
						if (sectionId == null || sectionId == undefined) {
							// a non-teacher must have a section
							if (!(this.role === "teacher")) {
								throw new Error(`${this.role} must be enrolled in a section`);
							}
						} else {
							// a teacher cannot be enrolled in a section
							if (this.role === "teacher") {
								throw new Error(
									"A teacher cannot be enrolled at the section level"
								);
							}
						}
					},
				},
			},
		},
		{
			indexes: [
				// avoids duplicate enrollments
				{
					unique: true,
					fields: ["userId", "courseId"],
					name: "custom_unique_teacher_constraint",
				},
				{
					unique: true,
					fields: ["userId", "sectionId"],
					name: "custom_unique_student_constraint",
				},
			],
			timestamps: true,
		}
	);

	Enrollment.associate = (models) => {
		Enrollment.belongsTo(models.Course);
		Enrollment.belongsTo(models.Section);
		Enrollment.belongsTo(models.User);
		Enrollment.hasMany(models.Response);
	};

	return Enrollment;
};
