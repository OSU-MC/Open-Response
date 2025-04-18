const app = require('../../../app/app')
const db = require('../../../app/models')
const jwtUtils = require('../../../lib/jwt_utils')
const { generateUserSession } = require('../../../lib/auth')
const request = require('supertest')

describe('/courses endpoints', () => {

    let user
    let user2
    let course
    let course2
    let section
    let section2
    let section3
    let userXsrfCookie
    let userCookies
    let user2XsrfCookie
    let user2Cookies
    let enrollment
    let enrollment2

    beforeAll(async() => {

        user = await db.User.create({
            firstName: 'Dan',
            lastName: 'Smith',
            email: 'dannySmith@myclassroom.com',
            isTeacher: true,
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
            email: 'mitchdagoat@myclassroom.com',
            isTeacher: false,
            rawPassword: 'mitchell123!!'
        })
        user2Token = jwtUtils.encode({
            sub: user2.id
        })
        const user2Session = await generateUserSession(user2)
        user2Cookies = [`_myclassroom_session=${user2Token}`, `xsrf-token=${user2Session.csrfToken}`]

        course2 = await db.Course.create({
            name: "TestingTest 123",
            description: "Learning to test things",
            published: true
        })

        enrollment = await db.Enrollment.create({
            role: "teacher",
            courseId: course2.id,
            userId: user.id
        })
    })

    it('should respond with 201 when a valid course is created and should create an enrollment', async () => {
        
        const resp = await request(app).post('/courses').send({
            name: "Litness 101",
            description: "Wanna get lit? We'll show you how",
            published: false
        }).set('Cookie', userCookies)
        expect(resp.statusCode).toEqual(201)
        expect(resp.body.course.name).toEqual("Litness 101")
        expect(resp.body.course.description).toEqual("Wanna get lit? We'll show you how")
        expect(resp.body.course.published).toEqual(false)
        expect(resp.body.enrollment.courseId).toEqual(resp.body.course.id)
        expect(resp.body.enrollment.userId).toEqual(user.id)
        expect(resp.body.enrollment.role).toEqual("teacher")
        expect(resp.body.enrollment.section).toBeFalsy()
        course = resp.body.course
    })

    it('should respond with 400 for malformed request when there is no course name', async () => {
        
        const resp = await request(app).post('/courses').send({
            description: "Wanna get lit? We'll show you how",
            published: false
        }).set('Cookie', userCookies)
        expect(resp.statusCode).toEqual(400)
    })

    it('should respond with 201 when a valid section is created', async () => {

        const respSection = await request(app).post(`/courses/${course.id}/sections`).send({
            number: 15
        }).set('Cookie', userCookies)
        expect(respSection.statusCode).toEqual(201)
        expect(respSection.body.section.courseId).toEqual(course.id)
        expect(respSection.body.section.number).toEqual(15)
        expect(respSection.body.section.joinCode).toBeTruthy()
        section = respSection.body.section
    })

    it('should respond with 201 when a second section is created', async () => {

        const respSection = await request(app).post(`/courses/${course.id}/sections`).send({
            number: 25
        }).set('Cookie', userCookies)
        expect(respSection.statusCode).toEqual(201)
        expect(respSection.body.section.courseId).toEqual(course.id)
        expect(respSection.body.section.number).toEqual(25)
        expect(respSection.body.section.joinCode).toBeTruthy()
        section2 = respSection.body.section
    })

    it('should respond with 201 when a third section is created', async () => {

        const respSection = await request(app).post(`/courses/${course.id}/sections`).send({
            number: 35
        }).set('Cookie', userCookies)
        expect(respSection.statusCode).toEqual(201)
        expect(respSection.body.section.courseId).toEqual(course.id)
        expect(respSection.body.section.number).toEqual(35)
        expect(respSection.body.section.joinCode).toBeTruthy()
        section3 = respSection.body.section
    })

    it('should respond with 403 when a student tries to create a section', async () => {

        const respSection = await request(app).post(`/courses/${course.id}/sections`).send({
            number: 20
        }).set('Cookie', user2Cookies)
        expect(respSection.statusCode).toEqual(403)
    })

    it('should respond with 400 for malformed request when there is no section number', async () => {
        const respSection = await request(app).post(`/courses/${course.id}/sections`).send({
        }).set('Cookie', userCookies)
        expect(respSection.statusCode).toEqual(400)
    })

    it('should respond with 201 when a student joins a course section', async () => {
        
        const resp = await request(app).post('/courses/join').send({
            joinCode: section.joinCode
        }).set('Cookie', user2Cookies)
        expect(resp.statusCode).toEqual(201)
        expect(resp.body.section.courseId).toEqual(course.id)
        expect(resp.body.section.number).toEqual(section.number)
        expect(resp.body.enrollment.role).toEqual('student')
        expect(resp.body.enrollment.sectionId).toEqual(section.id)
        expect(resp.body.enrollment.userId).toEqual(user2.id)
        expect(resp.body.enrollment.courseId).toBeFalsy()
        
    })

    it('should respond with 201 when a student joins a course section', async () => {
        
        const resp = await request(app).post('/courses/join').send({
            joinCode: section2.joinCode
        }).set('Cookie', user2Cookies)
        expect(resp.statusCode).toEqual(201)
        expect(resp.body.section.courseId).toEqual(course.id)
        expect(resp.body.section.number).toEqual(section2.number)
        expect(resp.body.enrollment.role).toEqual('student')
        expect(resp.body.enrollment.sectionId).toEqual(section2.id)
        expect(resp.body.enrollment.userId).toEqual(user2.id)
        expect(resp.body.enrollment.courseId).toBeFalsy()
        
    })

    it('should respond with 404 when trying to join a course with incorrect join code', async () => {
        
        const resp = await request(app).post('/courses/join').send({
            joinCode: "XXXXXX"
        }).set('Cookie', user2Cookies)
        expect(resp.statusCode).toEqual(404)
    })

    it('should respond with 200 and the teacher courses enrolled in', async () => {
        
        const resp = await request(app).get('/courses').set('Cookie', userCookies)
        expect(resp.statusCode).toEqual(200)
        expect(resp.body.teacherCourses[1].id).toEqual(course.id)
        expect(resp.body.teacherCourses[1].name).toEqual("Litness 101")
        expect(resp.body.teacherCourses[1].description).toEqual("Wanna get lit? We'll show you how")
    })

    it('should respond with 200 and the student courses enrolled in', async () => {

        const respStudent = await request(app).get('/courses').set('Cookie', user2Cookies)
        expect(respStudent.statusCode).toEqual(200)
        expect(respStudent.body.studentCourses[0].id).toEqual(course.id)
        expect(respStudent.body.studentCourses[0].name).toEqual("Litness 101")
        expect(respStudent.body.studentCourses[0].description).toEqual("Wanna get lit? We'll show you how")
        expect(respStudent.body.studentCourses[0].Sections[0].id).toEqual(section.id)
        expect(respStudent.body.studentCourses[0].Sections[1].id).toEqual(section2.id)
    })

    it('should respond with 401 if authorization is wrong', async () => { 
        const resp = await request(app).get('/courses').set('Cookie', 'booooooo')
        expect(resp.statusCode).toEqual(401)
    })

    it('should respond with 403 when student tries to edit a course', async () => {
        const resp = await request(app).put(`/courses/${course.id}`).send({
            name: "Willy Wonka and his darn chocolate factory",
            description: "I've got a golden ticket dun dun dun dun dun",
            published: true
        }).set('Cookie', user2Cookies)
        expect(resp.statusCode).toEqual(403)
    })

    it('should respond with 403 when student tries to delete a course', async () => {
        const resp = await request(app).delete(`/courses/${course.id}`).set('Cookie', user2Cookies)
        expect(resp.statusCode).toEqual(403)
    })

    it('should respond with 400 when teacher tries to edit a course without required fields', async () => {
        const resp = await request(app).put(`/courses/${course.id}`).send({
        }).set('Cookie', userCookies)
        expect(resp.statusCode).toEqual(400)
    })

    it('should respond with 200 when teacher tries to edit a course', async () => {
        const resp = await request(app).put(`/courses/${course.id}`).send({
            name: "Willy Wonka and his darn chocolate factory",
            description: "I've got a golden ticket dun dun dun dun dun",
            published: true
        }).set('Cookie', userCookies)
        expect(resp.statusCode).toEqual(200)
        expect(resp.body.course.name).toEqual("Willy Wonka and his darn chocolate factory")
        expect(resp.body.course.description).toEqual("I've got a golden ticket dun dun dun dun dun")
        expect(resp.body.course.published).toEqual(true)
    })

    it('should respond with 200 when teacher tries to edit a course with only some fields', async () => {
        const resp = await request(app).put(`/courses/${course.id}`).send({
            description: "This is a description. No, like seriously it is"
        }).set('Cookie', userCookies)
        expect(resp.statusCode).toEqual(200)
        expect(resp.body.course.name).toEqual("Willy Wonka and his darn chocolate factory")
        expect(resp.body.course.description).toEqual("This is a description. No, like seriously it is")
        expect(resp.body.course.published).toEqual(true)
    })

    it('should respond with 204 when a teacher tries to delete a course', async () => {
        const courseId = course.id
        const resp = await request(app).delete(`/courses/${course.id}`).set('Cookie', userCookies)
        expect(resp.statusCode).toEqual(204)
        const deletedCourse = await db.Course.findByPk(courseId)
        expect(deletedCourse).toBeFalsy()
    })

    afterAll(async () => {
        await user.destroy()
        await user2.destroy()
    })
})
