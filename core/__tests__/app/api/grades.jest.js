const app = require("../../../app/app");
const db = require("../../../app/models");
const jwtUtils = require("../../../lib/jwt_utils");
const { generateUserSession } = require("../../../lib/auth");
const request = require("supertest");

describe("/grades endpoints", () => {
	let user;
	let user2;
	let user3;
	let user4;
	let user5;
	let user6;
	let course;
	let section;
	let section2;
	let enrollment;
	let enrollment2;
	let enrollment3;
	let enrollment4;
	let enrollment5;
	let enrollment6;
	let userXsrfCookie;
	let userCookies;
	let user2XsrfCookie;
	let user2Cookies;
	let user3XsrfCookie;
	let user3Cookies;
	let user4XsrfCookie;
	let user4Cookies;
	let user5XsrfCookie;
	let user5Cookies;
	let user6XsrfCookie;
	let user6Cookies;
	let question;
	let question2;
	let question3;
	let lecture;
	let questionInLecture;
	let questionInLecture2;
	let questionInLecture3;
	let response;
	let response2;
	let response3;
	let lectureForSection;

	beforeAll(async () => {
		user = await db.User.create({
			firstName: "Dan",
			lastName: "Smith",
			email: "dannySmith2@open-response.org",
			rawPassword: "Danny-o123!",
		});
		userToken = jwtUtils.encode({
			sub: user.id,
		});
		const userSession = await generateUserSession(user);
		userCookies = [
			`_openresponse_session=${userToken}`,
			`xsrf-token=${userSession.csrfToken}`,
		];

		user2 = await db.User.create({
			firstName: "Mitchell",
			lastName: "DaGoat",
			email: "mitchdabest@open-response.org",
			rawPassword: "mitchell123!!",
		});
		user2Token = jwtUtils.encode({
			sub: user2.id,
		});
		const user2Session = await generateUserSession(user2);
		user2Cookies = [
			`_openresponse_session=${user2Token}`,
			`xsrf-token=${user2Session.csrfToken}`,
		];

		user3 = await db.User.create({
			firstName: "Tester",
			lastName: "TheTest",
			email: "testingtesting124@open-response.org",
			rawPassword: "mitchell123!!",
		});
		user3Token = jwtUtils.encode({
			sub: user3.id,
		});
		const user3Session = await generateUserSession(user3);
		user3Cookies = [
			`_openresponse_session=${user3Token}`,
			`xsrf-token=${user3Session.csrfToken}`,
		];

		user4 = await db.User.create({
			firstName: "Fourth",
			lastName: "Person",
			email: "Iamdafourthmanman@open-response.org",
			rawPassword: "mitchell123!!",
		});
		user4Token = jwtUtils.encode({
			sub: user4.id,
		});
		const user4Session = await generateUserSession(user4);
		user4Cookies = [
			`_openresponse_session=${user4Token}`,
			`xsrf-token=${user4Session.csrfToken}`,
		];

		user5 = await db.User.create({
			firstName: "Fifth",
			lastName: "Person",
			email: "Iamdafifththmanman@open-response.org",
			rawPassword: "stewartmitch22!!",
		});
		user5Token = jwtUtils.encode({
			sub: user5.id,
		});
		const user5Session = await generateUserSession(user5);
		user5Cookies = [
			`_openresponse_session=${user5Token}`,
			`xsrf-token=${user5Session.csrfToken}`,
		];

		user6 = await db.User.create({
			firstName: "Sixth",
			lastName: "Person",
			email: "Iamdasixththmanman@open-response.org",
			rawPassword: "stewrgergmch22!!",
		});
		user6Token = jwtUtils.encode({
			sub: user6.id,
		});
		const user6Session = await generateUserSession(user6);
		user6Cookies = [
			`_openresponse_session=${user6Token}`,
			`xsrf-token=${user6Session.csrfToken}`,
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

		section2 = await db.Section.create({
			courseId: course.id,
			number: 2,
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

		enrollment4 = await db.Enrollment.create({
			role: "student",
			sectionId: section.id,
			userId: user4.id,
		});

		enrollment5 = await db.Enrollment.create({
			role: "student",
			sectionId: section2.id,
			userId: user5.id,
		});

		lecture = await db.Lecture.create({
			courseId: course.id,
			title: "intro questions",
			order: 1,
			description: "learning about random things",
		});

		question = await db.Question.create({
			type: "multiple choice",
			stem: "What is 1 + 2?",
			lectureId: lecture.id,
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
			type: "multiple answer",
			stem: "Which of these are state capitals?",
			lectureId: lecture.id,
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
			courseId: course.id,
		});

		question3 = await db.Question.create({
			type: "multiple answer",
			stem: "Which of these are state capitals?",
			lectureId: lecture.id,
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
			courseId: course.id,
		});

		lectureForSection = await db.LectureForSection.create({
			sectionId: section.id,
			lectureId: lecture.id,
			attendanceMethod: "join",
			published: true,
		});

		// Create LectureGradeWeight for the lectureForSection
		await db.LectureGradeWeight.create({
			LectureForSectionId: lectureForSection.id,
			weight: 1.0,
		});

		questionInLecture = await db.QuestionInLecture.create({
			questionId: question.id,
			lectureForSectionId: lectureForSection.id,
			order: 1,
			published: true,
		});

		questionInLecture2 = await db.QuestionInLecture.create({
			questionId: question2.id,
			lectureForSectionId: lectureForSection.id,
			order: 2,
			published: true,
		});

		questionInLecture3 = await db.QuestionInLecture.create({
			questionId: question3.id,
			lectureForSectionId: lectureForSection.id,
			order: 3,
			published: false,
		});

		response = await db.Response.create({
			enrollmentId: enrollment2.id,
			questionInLectureId: questionInLecture.id,
			score: 1.0,
		});

		response2 = await db.Response.create({
			enrollmentId: enrollment3.id,
			questionInLectureId: questionInLecture.id,
			score: 1.0,
		});

		response3 = await db.Response.create({
			enrollmentId: enrollment4.id,
			questionInLectureId: questionInLecture.id,
			score: 0.0,
		});

		// Create Grades objects for each student in the section for the lecture
		// Only for published questions (questionInLecture, questionInLecture2)
		await db.Grades.create({
			enrollmentId: enrollment2.id,
			userId: user2.id, // tag with correct user
			lectureForSectionId: lectureForSection.id,
			points: 1.0, // response.score * question.totalPoints (assume totalPoints=1 for each question)
			totalPoints: 3, // 3 questions in lecture
		});
	
	
		await db.Grades.create({
			enrollmentId: enrollment3.id,
			userId: user3.id, // tag with correct user
			lectureForSectionId: lectureForSection.id,
			points: 1.0,
			totalPoints: 3,
		});
		await db.Grades.create({
			enrollmentId: enrollment4.id,
			userId: user4.id, // tag with correct user
			lectureForSectionId: lectureForSection.id,
			points: 0.0,
			totalPoints: 3,
		});
	});

	it("should respond with 200 when a teacher gets grades for students in a section", async () => {
		const resp = await request(app)
			.get(`/courses/${course.id}/sections/${section.id}/grades`)
			.set("Cookie", userCookies);
		expect(resp.statusCode).toEqual(200);
		expect(resp.body[0].studentName).toEqual(
			`${user2.firstName} ${user2.lastName}`
		);
		expect(resp.body[0].studentId).toEqual(user2.id);
		expect(resp.body[0].grade).toEqual(0.33);
		expect(resp.body[0].totalQuestions).toEqual(3);
		expect(resp.body[0].totalAnswered).toEqual(1);
		expect(resp.body[0].totalScore).toEqual(1);
		// changed to 1 to repersent the number of points recived from the lecture, from the % of the lecture points received.
		// changed because questions now can be worth more than one points each.
		expect(resp.body[0].lectures[0].lectureGrade).toEqual(1); 
	});

	it("should respond with 200 when a student gets their for a section", async () => {
		const resp = await request(app)
			.get(`/courses/${course.id}/sections/${section.id}/grades`)
			.set("Cookie", user2Cookies);
		expect(resp.statusCode).toEqual(200);
		expect(resp.body[0].lectureId).toEqual(lecture.id);
		// changed to 1 to repersent the number of points recived from the lecture, from the % of the lecture points received.
		// changed because questions now can be worth more than one points each.
		expect(resp.body[0].lectureGrade).toEqual(1);
		expect(resp.body[0].totalQuestions).toEqual(3);
		expect(resp.body[0].totalAnswered).toEqual(1);
		expect(resp.body[0].totalScore).toEqual(1);
	});

	it("should respond with 200 when a student gets grades for students on /all", async () => {
		const resp = await request(app)
			.get(`/courses/${course.id}/sections/${section.id}/grades/all`)
			.set("Cookie", user2Cookies);
		expect(resp.statusCode).toEqual(200);
		expect(resp.body[0].studentId).toEqual(user2.id);
	});

    it('should respond with 200 when a teacher gets grades for students in a section', async () => {
        const resp = await request(app).get(`/courses/${course.id}/sections/${section.id}/grades`).set('Cookie', userCookies)
        expect(resp.statusCode).toEqual(200)
        expect(resp.body[0].studentName).toEqual(`${user2.firstName} ${user2.lastName}`)
        expect(resp.body[0].studentId).toEqual(user2.id)
		expect(resp.body[0].grade).toEqual(0.33)
        expect(resp.body[0].totalQuestions).toEqual(3)
        expect(resp.body[0].totalAnswered).toEqual(1)
        expect(resp.body[0].totalScore).toEqual(1)
		// changed to 1 to repersent the number of points recived from the lecture, from the % of the lecture points received.
		// changed because questions now can be worth more than one points each.
        expect(resp.body[0].lectures[0].lectureGrade).toEqual(1)
    })

    it('should respond with 200 when a student gets their for a section', async () => {
        const resp = await request(app).get(`/courses/${course.id}/sections/${section.id}/grades`).set('Cookie', user2Cookies)
        expect(resp.statusCode).toEqual(200)
        expect(resp.body[0].lectureId).toEqual(lecture.id)
        // changed to 1 to repersent the number of points recived from the lecture, from the % of the lecture points received.
		// changed because questions now can be worth more than one points each.
		expect(resp.body[0].lectureGrade).toEqual(1)
        expect(resp.body[0].totalQuestions).toEqual(3)
        expect(resp.body[0].totalAnswered).toEqual(1)
        expect(resp.body[0].totalScore).toEqual(1)
    })

    it('should respond with 403 when a student enrolled in a different section tries to get scores for the section in the URL', async () => {
        const resp = await request(app).get(`/courses/${course.id}/sections/${section.id}/grades`).set('Cookie', user5Cookies)
        expect(resp.statusCode).toEqual(403)
    })

    it('should respond with 403 when a user not enrolled in the course tries to get grades', async () => {
        const resp = await request(app).get(`/courses/${course.id}/sections/${section.id}/grades`).set('Cookie', user6Cookies)
        expect(resp.statusCode).toEqual(403)
    })

	it("should respond with 200 and correct courseGrade for a teacher (all students)", async () => {
		// NOTE: In the test setup, each student has a Grades object with points=1.0, totalPoints=3 (for 3 questions, but only 2 are published).
		// The endpoint uses points/totalPoints, so normalized grade is 1/3 = 33.33% for user2 and user3, 0/3 = 0% for user4.
		const resp = await request(app)
			.get(`/courses/${course.id}/sections/${section.id}/grades/courseGrade`)
			.set("Cookie", userCookies);
		expect(resp.statusCode).toEqual(200);
		const user2Grade = resp.body.find(s => s.studentId === user2.id);
		const user3Grade = resp.body.find(s => s.studentId === user3.id);
		const user4Grade = resp.body.find(s => s.studentId === user4.id);
		expect(user2Grade.courseGrade).toBeCloseTo(33.33, 2);
		expect(user3Grade.courseGrade).toBeCloseTo(33.33, 2);
		expect(user4Grade.courseGrade).toBeCloseTo(0.0, 2);
	});

	it("should respond with 200 and correct courseGrade for a student (self)", async () => {
		// See note above: user2 has 1/3 = 33.33%
		const resp = await request(app)
			.get(`/courses/${course.id}/sections/${section.id}/grades/courseGrade`)
			.set("Cookie", user2Cookies);
		expect(resp.statusCode).toEqual(200);
		expect(resp.body.studentId).toEqual(user2.id);
		expect(resp.body.courseGrade).toBeCloseTo(33.33, 2);
	});

	it("should return 0% for a student with no grades", async () => {
		// Password must be at least 11 characters
		const userNoGrades = await db.User.create({
			firstName: "NoGrades",
			lastName: "Student",
			email: "nogrades@open-response.org",
			rawPassword: "nope123456!!",
		});
		const enrollmentNoGrades = await db.Enrollment.create({
			role: "student",
			sectionId: section.id,
			userId: userNoGrades.id,
		});
		const userNoGradesToken = jwtUtils.encode({ sub: userNoGrades.id });
		const userNoGradesSession = await generateUserSession(userNoGrades);
		const userNoGradesCookies = [
			`_openresponse_session=${userNoGradesToken}`,
			`xsrf-token=${userNoGradesSession.csrfToken}`,
		];
		const resp = await request(app)
			.get(`/courses/${course.id}/sections/${section.id}/grades/courseGrade`)
			.set("Cookie", userNoGradesCookies);
		expect(resp.statusCode).toEqual(200);
		expect(resp.body.studentId).toEqual(userNoGrades.id);
		expect(resp.body.courseGrade).toBeCloseTo(0.0, 2);
		await userNoGrades.destroy();
	});

	it("should ignore unpublished lectures and questions in courseGrade calculation", async () => {
		// Add a new published lecture with weight, and an unpublished lecture with weight
		const lecture2 = await db.Lecture.create({
			courseId: course.id,
			title: "Published Lecture",
			order: 2,
			description: "Published lecture for testing",
		});
		const lectureForSection2 = await db.LectureForSection.create({
			sectionId: section.id,
			lectureId: lecture2.id,
			attendanceMethod: "join",
			published: true,
		});
		await db.LectureGradeWeight.create({
			LectureForSectionId: lectureForSection2.id,
			weight: 2.0,
		});
		const question4 = await db.Question.create({
			type: "multiple choice",
			stem: "What is 2+2?",
			lectureId: lecture2.id,
			content: { options: { 0: 3, 1: 4 } },
			answers: { 0: false, 1: true },
			courseId: course.id,
		});
		const questionInLecture4 = await db.QuestionInLecture.create({
			questionId: question4.id,
			lectureForSectionId: lectureForSection2.id,
			order: 1,
			published: true,
		});
		// Give user2 a perfect score on this lecture
		await db.Grades.create({
			enrollmentId: enrollment2.id,
			userId: user2.id,
			lectureForSectionId: lectureForSection2.id,
			points: 1.0,
			totalPoints: 1,
		});
		// Add an unpublished lecture (should be ignored)
		const lecture3 = await db.Lecture.create({
			courseId: course.id,
			title: "Unpublished Lecture",
			order: 3,
			description: "Should be ignored",
		});
		const lectureForSection3 = await db.LectureForSection.create({
			sectionId: section.id,
			lectureId: lecture3.id,
			attendanceMethod: "join",
			published: false,
		});
		await db.LectureGradeWeight.create({
			LectureForSectionId: lectureForSection3.id,
			weight: 5.0,
		});
		const resp = await request(app)
			.get(`/courses/${course.id}/sections/${section.id}/grades/courseGrade`)
			.set("Cookie", user2Cookies);
		expect(resp.statusCode).toEqual(200);
		// user2: lecture1 (1/3), lecture2 (1/1), weights 1+2=3
		// weighted = (1/3*1 + 1/1*2)/3 = (0.333 + 2)/3 = 0.7777...*100 = 77.78
		expect(resp.body.courseGrade).toBeCloseTo(77.78, 2);
		// Clean up
		await lecture2.destroy();
		await lectureForSection2.destroy();
		await question4.destroy();
		await questionInLecture4.destroy();
		await lecture3.destroy();
		await lectureForSection3.destroy();
	});

	it("should calculate weighted average correctly for partial grades", async () => {
		// Add a new published lecture with weight 2.0
		const lecture2 = await db.Lecture.create({
			courseId: course.id,
			title: "Weighted Lecture",
			order: 2,
			description: "Weighted lecture for testing",
		});
		const lectureForSection2 = await db.LectureForSection.create({
			sectionId: section.id,
			lectureId: lecture2.id,
			attendanceMethod: "join",
			published: true,
		});
		await db.LectureGradeWeight.create({
			LectureForSectionId: lectureForSection2.id,
			weight: 2.0,
		});
		const question4 = await db.Question.create({
			type: "multiple choice",
			stem: "What is 2+2?",
			lectureId: lecture2.id,
			content: { options: { 0: 3, 1: 4 } },
			answers: { 0: false, 1: true },
			courseId: course.id,
		});
		const questionInLecture4 = await db.QuestionInLecture.create({
			questionId: question4.id,
			lectureForSectionId: lectureForSection2.id,
			order: 1,
			published: true,
		});
		// Give user2 a perfect score on this lecture, user3 gets 0
		await db.Grades.create({
			enrollmentId: enrollment2.id,
			userId: user2.id,
			lectureForSectionId: lectureForSection2.id,
			points: 1.0,
			totalPoints: 1,
		});
		await db.Grades.create({
			enrollmentId: enrollment3.id,
			userId: user3.id,
			lectureForSectionId: lectureForSection2.id,
			points: 0.0,
			totalPoints: 1,
		});
		const resp = await request(app)
			.get(`/courses/${course.id}/sections/${section.id}/grades/courseGrade`)
			.set("Cookie", userCookies);
		expect(resp.statusCode).toEqual(200);
		const user2Grade = resp.body.find(s => s.studentId === user2.id);
		const user3Grade = resp.body.find(s => s.studentId === user3.id);
		// user2: lecture1 (1/3), lecture2 (1/1), weights 1+2=3
		// weighted = (1/3*1 + 1*2)/3 = (0.333 + 2)/3 = 0.7777...*100 = 77.78
		// user3: lecture1 (1/3), lecture2 (0/1), weights 1+2=3
		// weighted = (1/3*1 + 0*2)/3 = (0.333 + 0)/3 = 0.1111...*100 = 11.11
		expect(user2Grade.courseGrade).toBeCloseTo(77.78, 2);
		expect(user3Grade.courseGrade).toBeCloseTo(11.11, 2);
		// Clean up
		await lecture2.destroy();
		await lectureForSection2.destroy();
		await question4.destroy();
		await questionInLecture4.destroy();
	});

	it("should return 403 for unauthorized user (not enrolled)", async () => {
		const resp = await request(app)
			.get(`/courses/${course.id}/sections/${section.id}/grades/courseGrade`)
			.set("Cookie", user6Cookies);
		expect(resp.statusCode).toEqual(403);
	});

	it("should return 400 for invalid courseId or sectionId", async () => {
		const resp = await request(app)
			.get(`/courses/abc/sections/def/grades/courseGrade`)
			.set("Cookie", userCookies);
		expect(resp.statusCode).toEqual(400);
	});

    afterAll(async () => {
        await user.destroy()
        await user2.destroy()
        await user3.destroy()
        await user4.destroy()
        await user5.destroy()
        await user6.destroy()
        await course.destroy() // should cascade on delete and delete sections and enrollments as well
    });
});
