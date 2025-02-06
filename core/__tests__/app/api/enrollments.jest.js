const app = require('../../../app/app')
const db = require('../../../app/models')
const jwtUtils = require('../../../lib/jwt_utils')
const { generateUserSession } = require('../../../lib/auth')
const request = require('supertest')

describe('/enrollments and /enrollments/enrollment_id endpoints', () => {

    let user
    let user2
    let user3
    let user4
    let course
    let course2
    let section
    let section2
    let enrollment
    let enrollment2
    let enrollment3
    let enrollment4
    let userXsrfCookie
    let userCookies
    let user2XsrfCookie
    let user2Cookies
    let user3XsrfCookie
    let user3Cookies
    let user4XsrfCookie
    let user4Cookies

    beforeAll(async() => {

        user = await db.User.create({
            firstName: 'Dan',
            lastName: 'Smith',
            email: 'dannySmith@myclassroom.com',
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
            rawPassword: 'mitchell123!!'
        })
        user2Token = jwtUtils.encode({
            sub: user2.id
        })
        const user2Session = await generateUserSession(user2)
        user2Cookies = [`_myclassroom_session=${user2Token}`, `xsrf-token=${user2Session.csrfToken}`]

        user3 = await db.User.create({
            firstName: 'TheUser',
            lastName: 'ItsMe',
            email: 'theuser@myclassroom.com',
            rawPassword: 'Imtheuseryesthatsme'
        })
        user3Token = jwtUtils.encode({
            sub: user3.id
        })
        const user3Session = await generateUserSession(user3)
        user3Cookies = [`_myclassroom_session=${user3Token}`, `xsrf-token=${user3Session.csrfToken}`]

        user4 = await db.User.create({
            firstName: 'HelloImauser',
            lastName: 'yessir',
            email: 'yessir@myclassroom.com',
            rawPassword: 'youalreadyknowwhoitis'
        })
        user4Token = jwtUtils.encode({
            sub: user4.id
        })
        const user4Session = await generateUserSession(user4)
        user4Cookies = [`_myclassroom_session=${user4Token}`, `xsrf-token=${user4Session.csrfToken}`]

        course = await db.Course.create({
            name: 'Testing Things 101',
            description: 'This will be a course about testing things, most notably in jest',
            published: false
        })

        course2 = await db.Course.create({
            name: 'Testing Things 102',
            description: 'This will be a course about testing things, most notably in jest. This is part 2',
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
            sectionId: section2.id,
            userId: user3.id
        })

        enrollment4 = await db.Enrollment.create({
            role: 'teacher',
            courseId: course2.id,
            userId: user4.id
        })

    })

    it('should respond with 200 when a teacher gets their roster', async () => {
        const resp = await request(app).get(`/courses/${course.id}/enrollments`).set('Cookie', userCookies)
        expect(resp.statusCode).toEqual(200)
        expect(resp.body.enrollments.length).toEqual(2)
        expect(resp.body.enrollments[0].userId).toEqual(user2.id)
        expect(resp.body.enrollments[0].role).toEqual('student')
        expect(resp.body.enrollments[0].sectionId).toEqual(section.id)
        expect(resp.body.enrollments[0].User.email).toEqual(user2.email)
        expect(resp.body.enrollments[1].userId).toEqual(user3.id)
        expect(resp.body.enrollments[1].role).toEqual('student')
        expect(resp.body.enrollments[1].sectionId).toEqual(section2.id)
        expect(resp.body.enrollments[1].User.email).toEqual(user3.email)
    })

    it('should respond with 403 when a student tries to get the roster', async () => { 
        const resp = await request(app).get(`/courses/${course.id}/enrollments`).set('Cookie', user2Cookies)
        expect(resp.statusCode).toEqual(403)
    })

    it('should respond with 200 when a teacher changes a student section', async () => {
        const resp = await request(app).put(`/courses/${course.id}/enrollments/${enrollment3.id}`).send({
            sectionId: section.id
        }).set('Cookie', userCookies)
        expect(resp.statusCode).toEqual(200)
        expect(resp.body.enrollment.userId).toEqual(user3.id)
        expect(resp.body.enrollment.role).toEqual('student')
        expect(resp.body.enrollment.sectionId).toEqual(section.id)
    })

    it('should respond with 403 when a student tries to change section', async () => {
        const resp = await request(app).put(`/courses/${course.id}/enrollments/${enrollment3.id}`).send({
            sectionId: section2.id
        }).set('Cookie', user3Cookies)
        expect(resp.statusCode).toEqual(403)
    })

    it('should respond with 400 when a request does not contain a section number to switch to', async () => {
        const resp = await request(app).put(`/courses/${course.id}/enrollments/${enrollment3.id}`).send({
        }).set('Cookie', userCookies)
        expect(resp.statusCode).toEqual(400)
    })

    it('should respond with 400 when the section number to switch to does not exist', async () => {
        const resp = await request(app).put(`/courses/${course.id}/enrollments/${enrollment3.id}`).send({
            sectionId: 100000
        }).set('Cookie', userCookies)
        expect(resp.statusCode).toEqual(400)
    })

    it('should respond with 400 when teacher for a different course tries to delete enrollment', async () => {
        const resp = await request(app).delete(`/courses/${course2.id}/enrollments/${enrollment3.id}`).set('Cookie', user4Cookies)
        expect(resp.statusCode).toEqual(400)
    })

    it('should respond with 204 when deleting an enrollment', async () => {
        const resp = await request(app).delete(`/courses/${course.id}/enrollments/${enrollment3.id}`).set('Cookie', userCookies)
        expect(resp.statusCode).toEqual(204)

        const respEnrollments = await request(app).get(`/courses/${course.id}/enrollments`).set('Cookie', userCookies)
        expect(respEnrollments.statusCode).toEqual(200)
        expect(respEnrollments.body.enrollments.length).toEqual(1)
        expect(respEnrollments.body.enrollments[0].userId).toEqual(user2.id)
        expect(respEnrollments.body.enrollments[0].role).toEqual('student')
        expect(respEnrollments.body.enrollments[0].sectionId).toEqual(section.id)
    })

    it('should respond with 403 when a student tries deleting an enrollment', async () => {
        const resp = await request(app).delete(`/courses/${course.id}/enrollments/${enrollment3.id}`).set('Cookie', user2Cookies)
        expect(resp.statusCode).toEqual(403)
    })
    

    afterAll(async () => {
        await user.destroy()
        await user2.destroy()
        await user3.destroy()
        await course.destroy() // should cascade on delete and delete sections and enrollments as well
    })
})
