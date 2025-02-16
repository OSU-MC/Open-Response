"use strict";
const db = require("../../../app/models");
const { UniqueConstraintError, ValidationError } = require("sequelize");

describe("Grades model", () => {
	let user;
	let course;
	let section;
	let enrollment;
	let lecture;
	let lectureForSection;
	let question;
	let questionInLecture;

	beforeAll(async () => {
		user = await db.User.create({
			firstName: "Dan",
			lastName: "Smith",
			email: "danSmith2@myclassroom.com",
			rawPassword: "Danny-o123!",
		});
		course = await db.Course.create({
			name: "Testing Things",
			description: "An introduction to testing many things",
		});
		section = await db.Section.create({
			number: 16,
			joinCode: "1yhs19",
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
		lectureForSection = await db.LectureForSection.create({
			lectureId: lecture.id,
			sectionId: section.id,
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
			lectureId: lecture.id,
		});
		questionInLecture = await db.QuestionInLecture.create({
			lectureForSectionId: lectureForSection.id,
			questionId: question.id,
		});
	});

	it("can be created with valid data", async () => {
		const grade = await db.Grades.create({
			userId: user.id,
			enrollmentId: enrollment.id,
			lectureForSectionId: lectureForSection.id,
			points: 9.5,
			totalPoints: 10.0,
		});
		expect(grade.userId).toBe(user.id);
		expect(grade.enrollmentId).toBe(enrollment.id);
		expect(grade.lectureForSectionId).toBe(lectureForSection.id);
		expect(grade.points).toBe(9.5);
		expect(grade.totalPoints).toBe(10.0);
	});

	it("should reject negative points", async () => {
		await expect(
			db.Grades.create({
				userId: user.id,
				enrollmentId: enrollment.id,
				lectureForSectionId: lectureForSection.id,
				points: -5,
				totalPoints: 10.0,
			})
		).rejects.toThrow(ValidationError);
	});

	it("should reject negative totalPoints", async () => {
		await expect(
			db.Grades.create({
				userId: user.id,
				enrollmentId: enrollment.id,
				lectureForSectionId: lectureForSection.id,
				points: 5,
				totalPoints: -10.0,
			})
		).rejects.toThrow(ValidationError);
	});

	it("should allow zero points", async () => {
		const grade = await db.Grades.create({
			userId: user.id,
			enrollmentId: enrollment.id,
			lectureForSectionId: lectureForSection.id,
			points: 0,
			totalPoints: 10.0,
		});
		expect(grade.points).toBe(0);
		expect(grade.totalPoints).toBe(10.0);
	});

	it("should reject a grade without lectureForSectionId", async () => {
		await expect(
			db.Grades.create({
				userId: user.id,
				enrollmentId: enrollment.id,
				points: 8.0,
				totalPoints: 10.0,
			})
		).rejects.toThrow(ValidationError);
	});

	afterAll(async () => {
		await questionInLecture.destroy();
		await question.destroy();
		await lectureForSection.destroy();
		await lecture.destroy();
		await enrollment.destroy();
		await section.destroy();
		await course.destroy();
		await user.destroy();
	});
});
