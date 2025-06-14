'use strict';

const db = require("../../../app/models");

describe("Response model", () => {
	let course;
	let user;
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
			email: "danSmith2@open-response.org",
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
			attendanceMethod: 'join'
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
			questionId: question.id
		});
	});

	describe("Response.create", () => {
		it("should create a valid response", async () => {
			let resp = await db.Response.create({
				score: 0.96,
				submission: {
					0: true,
					1: true,
					2: false,
					3: false,
				},
				questionInLectureId: questionInLecture.id,
				enrollmentId: enrollment.id,
			});
			expect(resp.score).toEqual(0.96);
			expect(resp.submission["0"]).toEqual(true);
			expect(resp.submission["1"]).toEqual(true);
			expect(resp.submission["2"]).toEqual(false);
			expect(resp.submission["3"]).toEqual(false);
			expect(resp.softDelete).toBeFalsy(); // Ensure soft delete is false by default
			await resp.destroy();
		});

		it("should default to an empty submission", async () => {
			let resp = await db.Response.create({
				score: 0.96,
				questionInLectureId: questionInLecture.id,
				enrollmentId: enrollment.id,
			});
			expect(resp.score).toEqual(0.96);
			expect(resp.submission).toEqual({});
			await resp.destroy();
		});

		it("should invalidate because score is too high", async () => {
			await expect(
				db.Response.create({
					score: 1.01,
					submission: {
						0: true,
						1: true,
						2: false,
						3: false,
					},
					questionId: question.id,
					enrollmentId: enrollment.id,
				})
			).rejects.toThrow("Validation error: score cannot be greater than 1");
		});

		it("should invalidate because score is too low", async () => {
			await expect(
				db.Response.create({
					score: -0.25,
					submission: {
						0: true,
						1: true,
						2: false,
						3: false,
					},
					questionId: question.id,
					enrollmentId: enrollment.id,
				})
			).rejects.toThrow("Validation error: score cannot be less than 0");
		});

		it("should invalidate because score is nothing", async () => {
			await expect(
				db.Response.create({
					submission: {
						0: true,
						1: true,
						2: false,
						3: false,
					},
					questionId: question.id,
					enrollmentId: enrollment.id,
				})
			).rejects.toThrow("notNull Violation: a response must have a score");
		});

		it("should invalidate without a question", async () => {
			await expect(
				db.Response.create({
					score: 0.96,
					submission: {
						0: true,
						1: true,
						2: false,
						3: false,
					},
					enrollmentId: enrollment.id,
				})
			).rejects.toThrow("notNull Violation: a response must have question in a lecture");
		});

		it("should invalidate without an enrollment", async () => {
			await expect(
				db.Response.create({
					score: 0.96,
					submission: {
						0: true,
						1: true,
						2: false,
						3: false,
					},
					questionId: question.id,
				})
			).rejects.toThrow("a response must have an enrollment");
		});
	});

	describe("Response.update", () => {
		let response;

		beforeEach(async () => {
			response = await db.Response.create({
				score: 0.75,
				submission: {
					0: true,
					1: false,
					2: true,
					3: false,
				},
				questionInLectureId: questionInLecture.id,
				enrollmentId: enrollment.id,
			});
		});

		it("should update the score", async () => {
			await db.Response.update(
				{ score: 0.85 },
				{ where: { id: response.id } }
			);
			const updatedResponse = await db.Response.findByPk(response.id);
			expect(updatedResponse.score).toEqual(0.85);
		});

		it("should soft delete a response", async () => {
			await db.Response.update(
				{ softDelete: true },
				{ where: { id: response.id } }
			);
			const updatedResponse = await db.Response.findByPk(response.id);
			expect(updatedResponse.softDelete).toBeTruthy();
		});

		afterEach(async () => {
			await response.destroy();
		});
	});

	afterAll(async () => {
		await questionInLecture.destroy();
		await lectureForSection.destroy();
		await question.destroy();
		await lecture.destroy();
		await enrollment.destroy();
		await section.destroy();
		await course.destroy();
		await user.destroy();
	});
});
