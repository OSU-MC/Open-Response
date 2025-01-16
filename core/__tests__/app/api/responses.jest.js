const app = require("../../../app/app");
const db = require("../../../app/models");
const jwtUtils = require("../../../lib/jwt_utils");
const { generateUserSession } = require("../../../lib/auth");
const request = require("supertest");
const { INET } = require("sequelize");

describe("/responses endpoints", () => {
	let user;
	let user2;
	let user3;
	let course;
	let section;
	let enrollment;
	let enrollment2;
	let enrollment3;
	let userXsrfCookie;
	let userCookies;
	let user2XsrfCookie;
	let user2Cookies;
	let user3XsrfCookie;
	let user3Cookies;
	let question;
	let question2;
	let question3;
	let lecture;
	let questionInLecture;
	let questionInLecture2;
	let questionInLecture3;
	let response;

	beforeAll(async () => {
		user = await db.User.create({
			firstName: "Dan",
			lastName: "Smith",
			email: "dannySmith@myclassroom.com",
			rawPassword: "Danny-o123!",
		});
		userToken = jwtUtils.encode({
			sub: user.id,
		});
		const userSession = await generateUserSession(user);
		userCookies = [
			`_myclassroom_session=${userToken}`,
			`xsrf-token=${userSession.csrfToken}`,
		];

		user2 = await db.User.create({
			firstName: "Mitchell",
			lastName: "DaGoat",
			email: "mitchdagoat@myclassroom.com",
			rawPassword: "mitchell123!!",
		});
		user2Token = jwtUtils.encode({
			sub: user2.id,
		});
		const user2Session = await generateUserSession(user2);
		user2Cookies = [
			`_myclassroom_session=${user2Token}`,
			`xsrf-token=${user2Session.csrfToken}`,
		];

		user3 = await db.User.create({
			firstName: "Tester",
			lastName: "TheTest",
			email: "testingtesting123@myclassroom.com",
			rawPassword: "mitchelltest16!!",
		});
		user3Token = jwtUtils.encode({
			sub: user3.id,
		});
		const user3Session = await generateUserSession(user3);
		user3Cookies = [
			`_myclassroom_session=${user3Token}`,
			`xsrf-token=${user3Session.csrfToken}`,
		];

		course = await db.Course.create({
			name: "Testing Things 101",
			description:
				"This will be a course about testing things, most notably in jest",
			published: false,
		});

		section = await db.Section.create({
			courseId: course.id,
			number: 1,
		});

		enrollment = await db.Enrollment.create({
			role: "teacher",
			courseId: course.id,
			userId: user.id,
		});

		enrollment2 = await db.Enrollment.create({
			role: "student",
			sectionId: section.id,
			userId: user2.id,
		});

		enrollment3 = await db.Enrollment.create({
			role: "student",
			sectionId: section.id,
			userId: user3.id,
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
			weights: {
				0: 1,
				1: 1,
				2: 1,
				3: 1,
			},
			courseId: course.id,
		});

		question2 = await db.Question.create({
			type: "multiple answer",
			stem: "Which of these are state capitals?",
			content: {
				options: {
					0: "Portland",
					1: "Washington D.C.",
					2: "Olympia",
					3: "Salem",
				},
			},
			answers: {
				0: false,
				1: false,
				2: true,
				3: true,
			},
			weights: {
				0: 1,
				1: 1,
				2: 1,
				3: 1,
			},
			courseId: course.id,
		});

		question3 = await db.Question.create({
			type: "multiple answer",
			stem: "Which of these are state capitals?",
			content: {
				options: {
					0: "Portland",
					1: "Washington D.C.",
					2: "Olympia",
					3: "Salem",
				},
			},
			answers: {
				0: false,
				1: false,
				2: true,
				3: true,
			},
			weights: {
				0: 1,
				1: 1,
				2: 1,
				3: 1,
			},
			courseId: course.id,
		});

		lecture = await db.Lecture.create({
			courseId: course.id,
			title: "intro questions",
			order: 1,
			description: "learning about random things",
		});

		questionInLecture = await db.QuestionInLecture.create({
			questionId: question.id,
			lectureId: lecture.id,
			order: 1,
			published: true,
		});

		questionInLecture2 = await db.QuestionInLecture.create({
			questionId: question2.id,
			lectureId: lecture.id,
			order: 2,
			published: true,
		});

		questionInLecture3 = await db.QuestionInLecture.create({
			questionId: question3.id,
			lectureId: lecture.id,
			order: 3,
			published: false,
		});
	});

	it("should respond with 400 when a student tries to respond to an unpublished question", async () => {
		const resp = await request(app)
			.post(
				`/courses/${course.id}/lectures/${lecture.id}/questions/${question3.id}/responses`
			)
			.send({
				answers: {
					0: false,
					1: true,
					2: false,
					3: false,
				},
			})
			.set("Cookie", user2Cookies);
		expect(resp.statusCode).toEqual(400);
	});

	it("should respond with 400 when the request has incomplete submission", async () => {
		const resp = await request(app)
			.post(
				`/courses/${course.id}/lectures/${lecture.id}/questions/${question.id}/responses`
			)
			.send({
				answers: {
					0: false,
				},
			})
			.set("Cookie", user2Cookies);
		expect(resp.statusCode).toEqual(400);
	});

	it("should respond with 400 when the request has no submission", async () => {
		const resp = await request(app)
			.post(
				`/courses/${course.id}/lectures/${lecture.id}/questions/${question.id}/responses`
			)
			.send({})
			.set("Cookie", user2Cookies);
		expect(resp.statusCode).toEqual(400);
	});

	it("should respond with 400 when a student tries to respond to an unpublished question", async () => {
		const resp = await request(app)
			.post(
				`/courses/${course.id}/lectures/${lecture.id}/questions/${question3.id}/responses`
			)
			.send({
				answers: {
					0: false,
					1: true,
					2: false,
					3: false,
				},
			})
			.set("Cookie", user2Cookies);
		expect(resp.statusCode).toEqual(400);
	});

	it("should respond with 400 when the request has incomplete submission", async () => {
		const resp = await request(app)
			.post(
				`/courses/${course.id}/lectures/${lecture.id}/questions/${question.id}/responses`
			)
			.send({
				answers: {
					0: false,
				},
			})
			.set("Cookie", user2Cookies);
		expect(resp.statusCode).toEqual(400);
	});

	it("should respond with 400 when the request has no submission", async () => {
		const resp = await request(app)
			.post(
				`/courses/${course.id}/lectures/${lecture.id}/questions/${question.id}/responses`
			)
			.send({})
			.set("Cookie", user2Cookies);
		expect(resp.statusCode).toEqual(400);
	});

	it("should respond with 403 when a teacher tries to respond to a question", async () => {
		const resp = await request(app)
			.post(
				`/courses/${course.id}/lectures/${lecture.id}/questions/${question3.id}/responses`
			)
			.send({
				answers: {
					0: false,
					1: true,
					2: false,
					3: false,
				},
			})
			.set("Cookie", userCookies);
		expect(resp.statusCode).toEqual(403);
	});

	it("should respond with 201 when a student responds to a question that is published", async () => {
		const resp = await request(app)
			.post(
				`/courses/${course.id}/lectures/${lecture.id}/questions/${question.id}/responses`
			)
			.send({
				answers: {
					0: false,
					1: true,
					2: false,
					3: false,
				},
			})
			.set("Cookie", user2Cookies);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body.response.enrollmentId).toEqual(enrollment2.id);
		expect(resp.body.response.questionInLectureId).toEqual(
			questionInLecture.id
		);
		expect(resp.body.response.score).toEqual(1.0);
		expect(resp.body.response.submission).toEqual({
			0: false,
			1: true,
			2: false,
			3: false,
		});
	});

	it("should respond with 201 and a score of 0 when a student responds to a question incorrectly", async () => {
		const resp = await request(app)
			.post(
				`/courses/${course.id}/lectures/${lecture.id}/questions/${question.id}/responses`
			)
			.send({
				answers: {
					0: false,
					1: false,
					2: false,
					3: true,
				},
			})
			.set("Cookie", user3Cookies);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body.response.enrollmentId).toEqual(enrollment3.id);
		expect(resp.body.response.questionInLectureId).toEqual(
			questionInLecture.id
		);
		expect(resp.body.response.score).toEqual(0.0);
		expect(resp.body.response.submission).toEqual({
			0: false,
			1: false,
			2: false,
			3: true,
		});
		response = resp.body.response;
	});

	it("should respond with 201 and a score of 0.5 when a student responds to a mulitple answer question with 1 of 2 correct answers", async () => {
		const resp = await request(app)
			.post(
				`/courses/${course.id}/lectures/${lecture.id}/questions/${question2.id}/responses`
			)
			.send({
				answers: {
					0: false,
					1: false,
					2: false,
					3: true,
				},
			})
			.set("Cookie", user2Cookies);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body.response.enrollmentId).toEqual(enrollment2.id);
		expect(resp.body.response.questionInLectureId).toEqual(
			questionInLecture2.id
		);
		expect(resp.body.response.score).toEqual(0.5);
		expect(resp.body.response.submission).toEqual({
			0: false,
			1: false,
			2: false,
			3: true,
		});
	});

	it("should respond with 201 and a score of 0.5 when a student responds to a mulitple answer question with 2 of 2 correct answers and 1 incorrect answer", async () => {
		const resp = await request(app)
			.post(
				`/courses/${course.id}/lectures/${lecture.id}/questions/${question2.id}/responses`
			)
			.send({
				answers: {
					0: false,
					1: true,
					2: true,
					3: true,
				},
			})
			.set("Cookie", user3Cookies);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body.response.enrollmentId).toEqual(enrollment3.id);
		expect(resp.body.response.questionInLectureId).toEqual(
			questionInLecture2.id
		);
		expect(resp.body.response.score).toEqual(0.5);
		expect(resp.body.response.submission).toEqual({
			0: false,
			1: true,
			2: true,
			3: true,
		});
	});

	// write a test which uses points and totalPoints in the query params
	it("should respond with 201 and a score of 0.5", async () => {
		const resp = await request(app)
			.post(
				`/courses/${course.id}/lectures/${lecture.id}/questions/${question2.id}/responses`
			)
			.send({
				answers: {
					0: false,
					1: true,
					2: true,
					3: true,
				},
			})
			.query({ points: 1, totalPoints: 2 })
			.set("Cookie", user2Cookies);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body.response.enrollmentId).toEqual(enrollment2.id);
		expect(resp.body.response.questionInLectureId).toEqual(
			questionInLecture2.id
		);
		expect(resp.body.response.score).toEqual(0.5);
		expect(resp.body.response.submission).toEqual({
			0: false,
			1: true,
			2: true,
			3: true,
		});
	});

	// write another test which uses points and totalPoints in the query params and has a score of 0.8
	it("should respond with 201 and a score of 0.8", async () => {
		const resp = await request(app)
			.post(
				`/courses/${course.id}/lectures/${lecture.id}/questions/${question2.id}/responses`
			)
			.send({
				answers: {
					0: false,
					1: true,
					2: true,
					3: true,
				},
			})
			.query({ points: 4, totalPoints: 5 })
			.set("Cookie", user3Cookies);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body.response.enrollmentId).toEqual(enrollment3.id);
		expect(resp.body.response.questionInLectureId).toEqual(
			questionInLecture2.id
		);
		expect(resp.body.response.score).toEqual(0.5);
		expect(resp.body.response.submission).toEqual({
			0: false,
			1: true,
			2: true,
			3: true,
		});
	});

	// it("should respond with 404 when user tries to update another users response", async () => {
	// 	const resp = await request(app)
	// 		.put(
	// 			`/courses/${course.id}/lectures/${lecture.id}/questions/${question.id}/responses/${response.id}`
	// 		)
	// 		.send({
	// 			answers: {
	// 				0: false,
	// 				1: true,
	// 				2: false,
	// 				3: false,
	// 			},
	// 		})
	// 		.set("Cookie", user2Cookies);
	// 	expect(resp.statusCode).toEqual(404);
	// });

	// it("should respond with 400 when resubmission has no request body", async () => {
	// 	const resp = await request(app)
	// 		.put(
	// 			`/courses/${course.id}/lectures/${lecture.id}/questions/${question.id}/responses/${response.id}`
	// 		)
	// 		.send({})
	// 		.set("Cookie", user3Cookies);
	// 	expect(resp.statusCode).toEqual(400);
	// });

	// it("should respond with 200 and a score of 1 when a student resubmits to the correct answer", async () => {
	// 	const resp = await request(app)
	// 		.put(
	// 			`/courses/${course.id}/lectures/${lecture.id}/questions/${question.id}/responses/${response.id}`
	// 		)
	// 		.send({
	// 			answers: {
	// 				0: false,
	// 				1: true,
	// 				2: false,
	// 				3: false,
	// 			},
	// 		})
	// 		.set("Cookie", user3Cookies);
	// 	expect(resp.statusCode).toEqual(200);
	// 	expect(resp.body.response.enrollmentId).toEqual(enrollment3.id);
	// 	expect(resp.body.response.questionInLectureId).toEqual(
	// 		questionInLecture.id
	// 	);
	// 	expect(resp.body.response.score).toEqual(1.0);
	// 	expect(resp.body.response.submission).toEqual({
	// 		0: false,
	// 		1: true,
	// 		2: false,
	// 		3: false,
	// 	});
	// });

	afterAll(async () => {
		await user.destroy();
		await user2.destroy();
		await course.destroy(); // should cascade on delete and delete sections and enrollments as well
	});
});
