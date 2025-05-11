"use strict";
const db = require("../../../app/models");
const { UniqueConstraintError, ValidationError } = require("sequelize");

describe("Grades model", () => {
	let user, course, section, enrollment, lecture, lectureForSection, question, questionInLecture;

	beforeAll(async () => {
		// Ensure a valid user exists
		user = await db.User.create({
			firstName: "Dan",
			lastName: "Smith",
			email: "danSmith2@open-response.org",
			rawPassword: "Danny-o123!",
			isTeacher: false, // Ensure this field is correctly set
		});

		// Ensure a valid course exists
		course = await db.Course.create({
			name: "Testing Things",
			description: "An introduction to testing many things",
		});

		// Ensure a valid section exists
		section = await db.Section.create({
			number: 16,
			joinCode: "1yhs19",
			courseId: course.id,
		});

		// Ensure a valid enrollment exists
		enrollment = await db.Enrollment.create({
			role: "student",
			sectionId: section.id,
			userId: user.id,
		});

		// Ensure a valid lecture exists
		lecture = await db.Lecture.create({
			title: "Introduce Testing Thingy Things",
			description: "The things be testing thingy",
			courseId: course.id,
		});

		// Ensure a valid LectureForSection entry exists
		lectureForSection = await db.LectureForSection.create({
			lectureId: lecture.id,
			sectionId: section.id,
			attendanceMethod: "join", // Fix: Required field
		});

		// Ensure a valid question exists
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
			courseId: course.id, // Fix: Ensure the question is linked to a course
		});

		// Ensure a valid QuestionInLecture entry exists
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
		await grade.destroy();
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
		await grade.destroy();
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
		// Cleanup to prevent test pollution
		if (questionInLecture) await questionInLecture.destroy();
		if (question) await question.destroy();
		if (lectureForSection) await lectureForSection.destroy();
		if (lecture) await lecture.destroy();
		if (enrollment) await enrollment.destroy();
		if (section) await section.destroy();
		if (course) await course.destroy();
		if (user) await user.destroy();
	});
});