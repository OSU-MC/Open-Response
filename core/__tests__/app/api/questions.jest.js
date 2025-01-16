const app = require("../../../app/app");
const db = require("../../../app/models");
const jwtUtils = require("../../../lib/jwt_utils");
const { generateUserSession } = require("../../../lib/auth");
const request = require("supertest");

describe("/questions endpoints", () => {
	let user;
	let user2;
	let course;
	let section;
	let enrollment;
	let enrollment2;
	let userXsrfCookie;
	let userCookies;
	let user2XsrfCookie;
	let user2Cookies;
	let question;
	let question2;
	let question3;
	let question4;
	let question5;

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

		question2 = await db.Question.create({
			type: "multiple choice",
			stem: "What is the capital of Oregon?",
			content: {
				options: {
					0: "Portland",
					1: "Corvallis",
					2: "Bend",
					3: "Salem",
				},
			},
			answers: {
				0: false,
				1: false,
				2: false,
				3: true,
			},
			courseId: course.id,
		});

		question3 = await db.Question.create({
			type: "multiple choice",
			stem: "What is gravity on earth in m/s?",
			content: {
				options: {
					0: 9.8,
					1: 4.9,
					2: 15.4,
					3: 1.6,
				},
			},
			answers: {
				0: true,
				1: false,
				2: false,
				3: false,
			},
			courseId: course.id,
		});

		question4 = await db.Question.create({
			type: "multiple choice",
			stem: "What is 3 + 4?",
			content: {
				options: {
					0: 6,
					1: 7,
					2: 8,
					3: 9,
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

		question5 = await db.Question.create({
			type: "multiple choice",
			stem: "What is 3 + 5?",
			content: {
				options: {
					0: 6,
					1: 7,
					2: 8,
					3: 9,
				},
			},
			answers: {
				0: false,
				1: false,
				2: true,
				3: false,
			},
			courseId: course.id,
		});
	});

	it("should respond with 200 when a teacher gets the questions for a course", async () => {
		const resp = await request(app)
			.get(`/courses/${course.id}/questions?page=0&perPage=2`)
			.set("Cookie", userCookies);
		expect(resp.statusCode).toEqual(200);
		expect(resp.body.questions.length).toEqual(2);
		expect(resp.body.questions[0].courseId).toEqual(course.id);
		expect(resp.body.questions[0].type).toEqual("multiple choice");
		expect(resp.body.questions[0].stem).toEqual("What is 1 + 2?");
		expect(resp.body.questions[0].content.options).toEqual({
			0: 2,
			1: 3,
			2: 4,
			3: 5,
		});
		expect(resp.body.questions[0].answers).toEqual({
			0: false,
			1: true,
			2: false,
			3: false,
		});
		expect(resp.body.questions[1].courseId).toEqual(course.id);
		expect(resp.body.questions[1].type).toEqual("multiple choice");
		expect(resp.body.questions[1].stem).toEqual(
			"What is the capital of Oregon?"
		);
		expect(resp.body.questions[1].content.options).toEqual({
			0: "Portland",
			1: "Corvallis",
			2: "Bend",
			3: "Salem",
		});
		expect(resp.body.questions[1].answers).toEqual({
			0: false,
			1: false,
			2: false,
			3: true,
		});
		expect(resp.body.links.nextPage).toEqual(
			`/courses/${course.id}/questions?string=&page=1&perPage=2`
		);
		expect(resp.body.links.prevPage).toEqual("");
	});

	// note: pages are indexed like an array, starting at 0
	it("should respond with 200 when a teacher gets page 2 of the questions for a course", async () => {
		const resp = await request(app)
			.get(`/courses/${course.id}/questions?page=2&perPage=2`)
			.set("Cookie", userCookies);
		expect(resp.statusCode).toEqual(200);
		expect(resp.body.questions.length).toEqual(1);
		expect(resp.body.questions[0].courseId).toEqual(course.id);
		expect(resp.body.questions[0].type).toEqual("multiple choice");
		expect(resp.body.questions[0].stem).toEqual("What is 3 + 5?");
		expect(resp.body.questions[0].content.options).toEqual({
			0: 6,
			1: 7,
			2: 8,
			3: 9,
		});
		expect(resp.body.questions[0].answers).toEqual({
			0: false,
			1: false,
			2: true,
			3: false,
		});
		expect(resp.body.links.nextPage).toEqual("");
		expect(resp.body.links.prevPage).toEqual(
			`/courses/${course.id}/questions?string=&page=1&perPage=2`
		);
	});

	it("should respond with 200 when a teacher gets the questions for a course filtered by a search parameter", async () => {
		const resp = await request(app)
			.get(`/courses/${course.id}/questions?search=3&page=0&perPage=2`)
			.set("Cookie", userCookies);
		expect(resp.statusCode).toEqual(200);
		expect(resp.body.questions.length).toEqual(2);
		expect(resp.body.questions[0].courseId).toEqual(course.id);
		expect(resp.body.questions[0].type).toEqual("multiple choice");
		expect(resp.body.questions[0].stem).toEqual("What is 3 + 4?");
		expect(resp.body.questions[0].content.options).toEqual({
			0: 6,
			1: 7,
			2: 8,
			3: 9,
		});
		expect(resp.body.questions[0].answers).toEqual({
			0: false,
			1: true,
			2: false,
			3: false,
		});
		expect(resp.body.questions[1].courseId).toEqual(course.id);
		expect(resp.body.questions[1].type).toEqual("multiple choice");
		expect(resp.body.questions[1].stem).toEqual("What is 3 + 5?");
		expect(resp.body.questions[1].content.options).toEqual({
			0: 6,
			1: 7,
			2: 8,
			3: 9,
		});
		expect(resp.body.questions[1].answers).toEqual({
			0: false,
			1: false,
			2: true,
			3: false,
		});
	});

	it("should respond with 200 when a teacher gets the questions for a course", async () => {
		const resp = await request(app)
			.get(`/courses/${course.id}/questions?page=0&perPage=2`)
			.set("Cookie", userCookies);
		expect(resp.statusCode).toEqual(200);
		expect(resp.body.questions.length).toEqual(2);
		expect(resp.body.questions[0].courseId).toEqual(course.id);
		expect(resp.body.questions[0].type).toEqual("multiple choice");
		expect(resp.body.questions[0].stem).toEqual("What is 1 + 2?");
		expect(resp.body.questions[0].content.options).toEqual({
			0: 2,
			1: 3,
			2: 4,
			3: 5,
		});
		expect(resp.body.questions[0].answers).toEqual({
			0: false,
			1: true,
			2: false,
			3: false,
		});
		expect(resp.body.questions[1].courseId).toEqual(course.id);
		expect(resp.body.questions[1].type).toEqual("multiple choice");
		expect(resp.body.questions[1].stem).toEqual(
			"What is the capital of Oregon?"
		);
		expect(resp.body.questions[1].content.options).toEqual({
			0: "Portland",
			1: "Corvallis",
			2: "Bend",
			3: "Salem",
		});
		expect(resp.body.questions[1].answers).toEqual({
			0: false,
			1: false,
			2: false,
			3: true,
		});
		expect(resp.body.links.nextPage).toEqual(
			`/courses/${course.id}/questions?string=&page=1&perPage=2`
		);
		expect(resp.body.links.prevPage).toEqual("");
	});

	// note: pages are indexed like an array, starting at 0
	it("should respond with 200 when a teacher gets page 2 of the questions for a course", async () => {
		const resp = await request(app)
			.get(`/courses/${course.id}/questions?page=2&perPage=2`)
			.set("Cookie", userCookies);
		expect(resp.statusCode).toEqual(200);
		expect(resp.body.questions.length).toEqual(1);
		expect(resp.body.questions[0].courseId).toEqual(course.id);
		expect(resp.body.questions[0].type).toEqual("multiple choice");
		expect(resp.body.questions[0].stem).toEqual("What is 3 + 5?");
		expect(resp.body.questions[0].content.options).toEqual({
			0: 6,
			1: 7,
			2: 8,
			3: 9,
		});
		expect(resp.body.questions[0].answers).toEqual({
			0: false,
			1: false,
			2: true,
			3: false,
		});
		expect(resp.body.links.nextPage).toEqual("");
		expect(resp.body.links.prevPage).toEqual(
			`/courses/${course.id}/questions?string=&page=1&perPage=2`
		);
	});

	it("should respond with 200 when a teacher gets the questions for a course filtered by a search parameter", async () => {
		const resp = await request(app)
			.get(`/courses/${course.id}/questions?search=3&page=0&perPage=2`)
			.set("Cookie", userCookies);
		expect(resp.statusCode).toEqual(200);
		expect(resp.body.questions.length).toEqual(2);
		expect(resp.body.questions[0].courseId).toEqual(course.id);
		expect(resp.body.questions[0].type).toEqual("multiple choice");
		expect(resp.body.questions[0].stem).toEqual("What is 3 + 4?");
		expect(resp.body.questions[0].content.options).toEqual({
			0: 6,
			1: 7,
			2: 8,
			3: 9,
		});
		expect(resp.body.questions[0].answers).toEqual({
			0: false,
			1: true,
			2: false,
			3: false,
		});
		expect(resp.body.questions[1].courseId).toEqual(course.id);
		expect(resp.body.questions[1].type).toEqual("multiple choice");
		expect(resp.body.questions[1].stem).toEqual("What is 3 + 5?");
		expect(resp.body.questions[1].content.options).toEqual({
			0: 6,
			1: 7,
			2: 8,
			3: 9,
		});
		expect(resp.body.questions[1].answers).toEqual({
			0: false,
			1: false,
			2: true,
			3: false,
		});
	});

	it("should respond with 200 when query string parameters are left out and should get first 25 questions by default", async () => {
		const resp = await request(app)
			.get(`/courses/${course.id}/questions`)
			.set("Cookie", userCookies);
		expect(resp.statusCode).toEqual(200);
		expect(resp.body.questions.length).toEqual(5);
		expect(resp.body.links.nextPage).toEqual("");
		expect(resp.body.links.prevPage).toEqual("");
	});

	it("should respond with 400 when page number is out of bounds", async () => {
		const resp = await request(app)
			.get(`/courses/${course.id}/questions?page=3&perPage=2`)
			.set("Cookie", userCookies);
		expect(resp.statusCode).toEqual(400);
	});

	it("should respond with 403 when a student tries to get the questions", async () => {
		const resp = await request(app)
			.get(`/courses/${course.id}/questions?page=0&perPage=2`)
			.set("Cookie", user2Cookies);
		expect(resp.statusCode).toEqual(403);
	});

	it("should respond with 403 when a student tries to create a question", async () => {
		const resp = await request(app)
			.post(`/courses/${course.id}/questions`)
			.send({
				type: "multiple choice",
				stem: "What is 2 + 2?",
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
					1: false,
					2: true,
					3: false,
				},
			})
			.set("Cookie", user2Cookies);
		expect(resp.statusCode).toEqual(403);
	});

	it("should respond with 201 when a teacher tries to create a question", async () => {
		const resp = await request(app)
			.post(`/courses/${course.id}/questions`)
			.send({
				type: "multiple choice",
				stem: "What is 2 + 2?",
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
					1: false,
					2: true,
					3: false,
				},
			})
			.set("Cookie", userCookies);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body.question.type).toEqual("multiple choice");
		expect(resp.body.question.stem).toEqual("What is 2 + 2?");
		expect(resp.body.question.content.options).toEqual({
			0: 2,
			1: 3,
			2: 4,
			3: 5,
		});
		expect(resp.body.question.answers).toEqual({
			0: false,
			1: false,
			2: true,
			3: false,
		});
		expect(resp.body.question.courseId).toEqual(course.id);
	});

	it("should respond with 400 when fields are missing", async () => {
		const resp = await request(app)
			.post(`/courses/${course.id}/questions`)
			.send({
				type: "multiple choice",
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
					1: false,
					2: true,
					3: false,
				},
			})
			.set("Cookie", userCookies);
		expect(resp.statusCode).toEqual(400);
	});

	it("should respond with 400 (validation error) when question type is not supported yet", async () => {
		const resp = await request(app)
			.post(`/courses/${course.id}/questions`)
			.send({
				type: "graphing",
				stem: "Graph y = mx + b",
				content: {},
				answers: {},
			})
			.set("Cookie", userCookies);
		expect(resp.statusCode).toEqual(400);
	});

	afterAll(async () => {
		await user.destroy();
		await user2.destroy();
		await course.destroy(); // should cascade on delete and delete sections and enrollments as well
	});
});
