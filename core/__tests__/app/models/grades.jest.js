// Test the grades model
// Path: core/__tests__/app/models/grades.jest.js
// Compare this snippet from core/db/migrations/20240108211086-add-grades-relationship.js:
"use strict";
const db = require("../../../app/models");
const { UniqueConstraintError } = require("sequelize");

describe("Grades model", () => {
	let user;
	let course;
	let section;
	let enrollment;
	let lecture;
	let question;
	let questionInLecture;

	beforeAll(async () => {
		user = await db.User.create({
			firstName: "Dan",
			lastName: "Smith",
			email: "danSmith2@open-response.org",
			rawPassword: "Danny-o123!",
		});
		course = await db.Course.create({
			name: "Testing Things",
			description: "An introduction to testing many things",
		});
		section = await db.Section.create({
			number: 16,
			joinCode: "1yhs19", // some alphanumeric value
			courseId: course.id,
		});
		enrollment = await db.Enrollment.create({
			role: "student",
			sectionId: section.id,
			userId: user.id,
		});
		lecture = await db.Lecture.create({
			title: "Introduce Testing Thingy Things",
			description: "The things be testing thingy",
			courseId: course.id,
		});
		question = await db.Question.create({
			type: "multiple choice",
			stem: "What is 1 + 2?",
			content: {
				options: {
					0: 2,
					1: 3,
					2: 4,
					3: 5,
				},
			},
			answers: {
				0: false,
				1: true,
				2: false,
				3: false,
			},
			courseId: course.id,
		});
		questionInLecture = await db.QuestionInLecture.create({
			lectureId: lecture.id,
			questionId: question.id,
		});
	});

	it("can be created with valid data", async () => {
		const grade = await db.Grades.create({
			userId: user.id,
			enrollmentId: enrollment.id,
			sectionId: section.id,
			grade: 0.9,
		});
		expect(grade.userId).toBe(user.id);
		expect(grade.enrollmentId).toBe(enrollment.id);
		expect(grade.sectionId).toBe(section.id);
		expect(grade.grade).toBe(0.9);
	});

	afterAll(async () => {
		await enrollment.destroy();
		await section.destroy();
		await course.destroy();
		await user.destroy();
	});
});
