const app = require('../../../app/app')
const db = require('../../../app/models')
const jwtUtils = require('../../../lib/jwt_utils')
const { generateUserSession } = require('../../../lib/auth')
const request = require('supertest')

describe('/lectureSummaries endpoints', () => {

    let user
    let user2
    let user3
    let user4
    let user5
    let user6
    let course
    let section
    let section2
    let enrollment
    let enrollment2
    let enrollment3
    let enrollment4
    let enrollment5
    let enrollment6
    let userXsrfCookie
    let userCookies
    let user2XsrfCookie
    let user2Cookies
    let user3XsrfCookie
    let user3Cookies
    let user4XsrfCookie
    let user4Cookies
    let user5XsrfCookie
    let user5Cookies
    let user6XsrfCookie
    let user6Cookies
    let question
    let question2
    let question3
    let lecture
    let questionInLecture
    let questionInLecture2
    let questionInLecture3
    let response
    let response2
    let response3

    beforeAll(async() => {

        user = await db.User.create({
            firstName: 'Dan',
            lastName: 'Smith',
            email: 'dannySmith2@myclassroom.com',
            rawPassword: 'Danny-o123!'
        })
        userToken = jwtUtils.encode({
            sub: user.id
        })
        const userSession = await generateUserSession(user)
        userCookies = [`_myclassroom_session=${userToken}`, `xsrf-token=${userSession.csrfToken}`]
        

        user2 = await db.User.create({
            firstName: 'Mitchell',
            lastName: 'DaGoat',
            email: 'mitchdabest@myclassroom.com',
            rawPassword: 'mitchell123!!'
        })
        user2Token = jwtUtils.encode({
            sub: user2.id
        })
        const user2Session = await generateUserSession(user2)
        user2Cookies = [`_myclassroom_session=${user2Token}`, `xsrf-token=${user2Session.csrfToken}`]

        user3 = await db.User.create({
            firstName: 'Tester',
            lastName: 'TheTest',
            email: 'testingtesting124@myclassroom.com',
            rawPassword: 'mitchell123!!'
        })
        user3Token = jwtUtils.encode({
            sub: user3.id
        })
        const user3Session = await generateUserSession(user3)
        user3Cookies = [`_myclassroom_session=${user3Token}`, `xsrf-token=${user3Session.csrfToken}`]

        user4 = await db.User.create({
            firstName: 'Fourth',
            lastName: 'Person',
            email: 'Iamdafourthmanman@myclassroom.com',
            rawPassword: 'mitchell123!!'
        })
        user4Token = jwtUtils.encode({
            sub: user4.id
        })
        const user4Session = await generateUserSession(user4)
        user4Cookies = [`_myclassroom_session=${user4Token}`, `xsrf-token=${user4Session.csrfToken}`]

        user5 = await db.User.create({
            firstName: 'Fifth',
            lastName: 'Person',
            email: 'Iamdafifththmanman@myclassroom.com',
            rawPassword: 'stewartmitch22!!'
        })
        user5Token = jwtUtils.encode({
            sub: user5.id
        })
        const user5Session = await generateUserSession(user5)
        user5Cookies = [`_myclassroom_session=${user5Token}`, `xsrf-token=${user5Session.csrfToken}`]

        user6 = await db.User.create({
            firstName: 'Sixth',
            lastName: 'Person',
            email: 'Iamdasixththmanman@myclassroom.com',
            rawPassword: 'stewrgergmch22!!'
        })
        user6Token = jwtUtils.encode({
            sub: user6.id
        })
        const user6Session = await generateUserSession(user6)
        user6Cookies = [`_myclassroom_session=${user6Token}`, `xsrf-token=${user6Session.csrfToken}`]

        course = await db.Course.create({
            name: 'Testing Things 101',
            description: 'This will be a course about testing things, most notably in jest',
            published: false
        })

        section = await db.Section.create({
            courseId: course.id,
            number: 1
        })

        section2 = await db.Section.create({
            courseId: course.id,
            number: 2
        })

        enrollment = await db.Enrollment.create({
            role: 'teacher',
            courseId: course.id,
            userId: user.id
        })

        enrollment2 = await db.Enrollment.create({
            role: 'student',
            sectionId: section.id,
            userId: user2.id
        })

        enrollment3 = await db.Enrollment.create({
            role: 'student',
            sectionId: section.id,
            userId: user3.id
        })

        enrollment4 = await db.Enrollment.create({
            role: 'student',
            sectionId: section.id,
            userId: user4.id
        })

        enrollment5 = await db.Enrollment.create({
            role: 'student',
            sectionId: section2.id,
            userId: user5.id
        })

        question = await db.Question.create({
            type: 'multiple choice',
            stem: 'What is 1 + 2?',
            content: {
                options: {
                    0: 2,
                    1: 3,
                    2: 4,
                    3: 5
                }
            },
            answers: {
                0: false,
                1: true,
                2: false,
                3: false
            },
            courseId: course.id
        })

        question2 = await db.Question.create({
            type: 'multiple answer',
            stem: 'Which of these are state capitals?',
            content: {
                options: {
                    0: "Portland",
                    1: "Washington D.C.",
                    2: "Olympia",
                    3: "Salem"
                }
            },
            answers: {
                0: false,
                1: false,
                2: true,
                3: true
            },
            courseId: course.id
        })

        question3 = await db.Question.create({
            type: 'multiple answer',
            stem: 'Which of these are state capitals?',
            content: {
                options: {
                    0: "Portland",
                    1: "Washington D.C.",
                    2: "Olympia",
                    3: "Salem"
                }
            },
            answers: {
                0: false,
                1: false,
                2: true,
                3: true
            },
            courseId: course.id
        })

        lecture = await db.Lecture.create({
            courseId: course.id,
            title: 'intro questions',
            order: 1,
            description: 'learning about random things'
        })

        questionInLecture = await db.QuestionInLecture.create({
            questionId: question.id,
            lectureId: lecture.id,
            order: 1,
            published: true
        })

        questionInLecture2 = await db.QuestionInLecture.create({
            questionId: question2.id,
            lectureId: lecture.id,
            order: 2,
            published: true
        })

        questionInLecture3 = await db.QuestionInLecture.create({
            questionId: question3.id,
            lectureId: lecture.id,
            order: 3,
            published: false
        })

        response = await db.Response.create({
            enrollmentId: enrollment2.id,
            questionInLectureId: questionInLecture.id,
            score: 1.0
        })

        response2 = await db.Response.create({
            enrollmentId: enrollment3.id,
            questionInLectureId: questionInLecture.id,
            score: 1.0
        })

        response3 = await db.Response.create({
            enrollmentId: enrollment4.id,
            questionInLectureId: questionInLecture.id,
            score: 0.0
        })

    })

    it('should respond with 200 when a teacher gets responses to questions from a lecture', async () => {
        const resp = await request(app).get(`/courses/${course.id}/sections/${section.id}/lectures/${lecture.id}/responses`).set('Cookie', userCookies)
        expect(resp.statusCode).toEqual(200)
        expect(resp.body[0].numberOfResponses).toEqual(3)
        expect(resp.body[0].question.stem).toEqual(question.stem)
        expect(resp.body[0].averageScore).toEqual(0.67)
        expect(resp.body[0].responses[0].studentName).toEqual("Mitchell DaGoat")
        expect(resp.body[0].responses[0].response.score).toEqual(1)
    })

    it('should respond with 200 when a student gets their responses to questions in a lecture', async () => {
        const resp = await request(app).get(`/courses/${course.id}/sections/${section.id}/lectures/${lecture.id}/responses`).set('Cookie', user2Cookies)
        expect(resp.statusCode).toEqual(200)
        expect(resp.body[0].question.stem).toEqual(question.stem)
        expect(resp.body[0].response.score).toEqual(1)
        expect(resp.body[1].question.stem).toEqual(question2.stem)
        expect(resp.body[1].response).toBeUndefined()
    })

    it('should respond with 403 when a student tries to get responses for a section they are not enrolled in', async () => {
        const resp = await request(app).get(`/courses/${course.id}/sections/${section.id}/lectures/${lecture.id}/responses`).set('Cookie', user5Cookies)
        expect(resp.statusCode).toEqual(403)
    })

    it('should respond with 403 when a user tries to get responses for a course they are not enrolled in', async () => {
        const resp = await request(app).get(`/courses/${course.id}/sections/${section.id}/lectures/${lecture.id}/responses`).set('Cookie', user5Cookies)
        expect(resp.statusCode).toEqual(403)
    })

    afterAll(async () => {
        await user.destroy()
        await user2.destroy()
        await user3.destroy()
        await user4.destroy()
        await user5.destroy()
        await user6.destroy()
        await course.destroy() // should cascade on delete and delete sections and enrollments as well
    })
})
