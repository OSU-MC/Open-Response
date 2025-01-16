const app = require('../../../app/app')
const request = require('supertest')
const db = require('../../../app/models/index')
const jwtUtils = require('../../../lib/jwt_utils')
const { generateUserSession } = require('../../../lib/auth')

async function getUserFromEmail(email) {
    return await db.User.findOne({
        where: {
            email: email
        }
    })
}

describe('Test api/lecture.js request handlers', () => {
    // declare test objects in this scope, to be used throughout the tests
    let course, course_published, section1, section2, 
    teacher_resp, teacher, teacherToken, student_resp, 
    student, studentToken, unrelated_resp, unrelated,
    unrelatedToken, enrollment1, enrollment2, 
    lecture1, lecture2, lec1_sec1, lec1_sec2, lec2_sec1, 
    lec2_sec2, question1, q1_lec1, question2, q2_lec2,
    q1_lec2, enrollment3, studentXsrfCookie, teacherXsrfCookie,
    studentCookies, teacherCookies
    
    beforeAll(async () => {
        // create sample models for tests
        course = await db.Course.create({
            name: 'Capstone Course',
            description: 'Exploited labor'
        })
        course_published = await db.Course.create({
            name: 'Databases',
            description: 'SQL, just SQL',
            published: true
        })
        section1 = await db.Section.create({
            number: 1,
            joinCode: "xyz123",
            courseId: course.id
        })
        section2 = await db.Section.create({
            number: 2,
            joinCode: "abc789",
            courseId: course_published.id
        })
        teacher_resp = await request(app).post('/users').send({
            firstName: 'Dan',
            lastName: 'Smith',
            email: 'danSmith2@myclassroom.com',
            rawPassword: 'Danny-o123!',
            isTeacher: true,
            confirmedPassword: 'Danny-o123!'
        })
        teacher = await getUserFromEmail(teacher_resp.body.user.email)  // used to get ID
        teacherToken = jwtUtils.encode({
            sub: teacher.id
        })
        const teacherSession = await generateUserSession(teacher)
        teacherCookies = [`_myclassroom_session=${teacherToken}`, `xsrf-token=${teacherSession.csrfToken}`]

        student_resp = await request(app).post('/users').send({
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@myclassroom.com',
            rawPassword: 'superdupersecret',
            isTeacher: true,
            confirmedPassword: 'superdupersecret'
        })
        student = await getUserFromEmail(student_resp.body.user.email)  // used to get ID
        studentToken = jwtUtils.encode({
            sub: student.id
        })
        const studentSession = await generateUserSession(student)
        studentCookies = [`_myclassroom_session=${studentToken}`, `xsrf-token=${studentSession.csrfToken}`]

        unrelated_resp = await request(app).post('/users').send({
            firstName: 'Software',
            lastName: 'Engineer',
            email: 'swe@myclassroom.com',
            rawPassword: 'secretpassword45',
            isTeacher: true,
            confirmedPassword: 'secretpassword45'
        })
        unrelated = await getUserFromEmail(unrelated_resp.body.user.email)
        unrelatedToken = jwtUtils.encode({
            sub: unrelated.id
        })
        const unrelatedSession = await generateUserSession(unrelated)
        unrelatedCookies = [`_myclassroom_session=${unrelatedToken}`, `xsrf-token=${unrelatedSession.csrfToken}`]

        enrollment1 = await db.Enrollment.create({
            role: "teacher",
            courseId: course.id,
            userId: teacher.id
        })
        enrollment2 = await db.Enrollment.create({
            role: "student",
            sectionId: section1.id,
            userId: student.id
        })
        enrollment3 = await db.Enrollment.create({
            role: "student",
            sectionId: section2.id,
            userId: student.id
        })
        lecture1 = await db.Lecture.create({
            title: 'question set 1',
            order: 1,
            description: 'intro qs',
            courseId: course.id
        })
        lecture2 = await db.Lecture.create({
            title: 'question set 2',
            order: 2,
            description: 'intermediate qs',
            courseId: course_published.id
        })
        question1 = await db.Question.create({
            courseId: course.id,
            type: "multiple choice",
            stem: "what is the answer",
        })
        question2 = await db.Question.create({
            courseId: course_published.id,
            type: "multiple choice",
            stem: "but why",
        })

        // create relationships for sample models
        q1_lec1 = await db.QuestionInLecture.create({
            questionId: question1.id,
            lectureId: lecture1.id,
            published: false
        })
        q1_lec2 = await db.QuestionInLecture.create({
            questionId: question1.id,
            lectureId: lecture2.id,
            published: true
        })
        q2_lec2 = await db.QuestionInLecture.create({
            questionId: question2.id,
            lectureId: lecture2.id,
            published: false
        })
        lec1_sec1 = await db.LectureForSection.create({
            lectureId: lecture1.id,
            sectionId: section1.id,
            published: false
        })
        lec1_sec2 = await db.LectureForSection.create({
            lectureId: lecture1.id,
            sectionId: section2.id,
            published: true
        })
        lec2_sec1 = await db.LectureForSection.create({
            lectureId: lecture2.id,
            sectionId: section1.id,
            published: false
        })
        lec2_sec2 = await db.LectureForSection.create({
            lectureId: lecture2.id,
            sectionId: section2.id,
            published: true
        })
    })

    describe('GET /courses/:course_id/lectures', () => {
    
        it('should respond 204 for a student in unpublished course', async () => {
            const resp = await request(app).get(`/courses/${course.id}/lectures`).set('Cookie', studentCookies)

            expect(resp.statusCode).toEqual(204)
        })

        it('should respond with 401 for bad authorization token', async () => {
            const resp = await request(app).get(`/courses/${course.id}/lectures`).set('Cookie', "bad token")
            
            expect(resp.statusCode).toEqual(401)
        })

        it('should respond with 403 for someone who is not in course', async () => {
            const resp = await request(app).get(`/courses/${course.id}/lectures`).set('Cookie', unrelatedCookies)
            
            expect(resp.statusCode).toEqual(403)
        })

        it('should respond with 200 and lecture details for teacher', async () => {
            const resp = await request(app).get(`/courses/${course.id}/lectures`).set('Cookie', teacherCookies)
        
            expect(resp.statusCode).toEqual(200)
            expect(resp.body.lectures.length).toEqual(1)
            expect(resp.body.lectures[0].title).toEqual('question set 1')
            expect(resp.body.lectures[0].order).toEqual(1)
            expect(resp.body.lectures[0].description).toEqual('intro qs')
            expect(resp.body.lectures[0].courseId).toEqual(course.id)
        })

        it('should respond with 200 and lecture details for student in published course', async () => {
            const resp = await request(app).get(`/courses/${course_published.id}/lectures`).set('Cookie', studentCookies)
        
            expect(resp.statusCode).toEqual(200)
            expect(resp.body.lectures.length).toEqual(1)
            expect(resp.body.lectures[0].title).toEqual('question set 2')
            expect(resp.body.lectures[0].order).toEqual(2)
            expect(resp.body.lectures[0].description).toEqual('intermediate qs')
            expect(resp.body.lectures[0].courseId).toEqual(course_published.id)
        })
    })

    describe('POST /courses/:course_id/lectures', () => {
        it('should respond with 401 for bad authorization token', async () => {
            const resp = await request(app).post(`/courses/${course.id}/lectures`).send({
                title: "fresh lec",
                description: "just another lecture"
            }).set('Cookie', "waytoobadtoken")
            
            expect(resp.statusCode).toEqual(401)
        })

        it('should respond with 403 for someone who is not in course', async () => {
            const resp = await request(app).post(`/courses/${course.id}/lectures`).send({
                title: "fresh lec",
                description: "just another lecture"
            }).set('Cookie', unrelatedCookies)
            
            expect(resp.statusCode).toEqual(403)
        })

        it('should respond with 403 for student', async () => {
            const resp = await request(app).post(`/courses/${course.id}/lectures`).send({
                title: "fresh lec",
                description: "just another lecture"
            }).set('Cookie', studentCookies)
            
            expect(resp.statusCode).toEqual(403)
        })

        it('should respond with 400 for missing lecture title', async () => {
            const resp = await request(app).post(`/courses/${course.id}/lectures`).send({
                description: "just another lecture"
            }).set('Cookie', teacherCookies)
            
            expect(resp.statusCode).toEqual(400)
        })

        it('should respond with 201 if teacher successfully creates lecture', async () => {
            const resp = await request(app).post(`/courses/${course.id}/lectures`).send({
                title: "fresh lec",
                description: "just another lecture"
            }).set('Cookie', teacherCookies)
            
            expect(resp.statusCode).toEqual(201)
            expect(resp.body.title).toEqual("fresh lec")
            expect(resp.body.description).toEqual("just another lecture")
        })
    })

    describe('GET /courses/:course_id/lectures/:lecture_id', () => {
        it('should respond with 401 for bad authorization token', async () => {
            const resp = await request(app).get(`/courses/${course.id}/lectures/${lecture1.id}`).set('Cookie', "waytoobadtoken")
            
            expect(resp.statusCode).toEqual(401)
        })

        it('should respond with 403 for someone who is not in course', async () => {
            const resp = await request(app).get(`/courses/${course.id}/lectures/${lecture1.id}`).set('Cookie', unrelatedCookies)
            
            expect(resp.statusCode).toEqual(403)
        })

        it('should respond with 200 and corresponding info for teacher', async () => {
            const resp = await request(app).get(`/courses/${course.id}/lectures/${lecture1.id}`).set('Cookie', teacherCookies)
            
            expect(resp.statusCode).toEqual(200)
            expect(resp.body.lecture.id).toEqual(lecture1.id)
            expect(resp.body.lecture.courseId).toEqual(course.id)
            expect(resp.body.questions.length).toEqual(1)
            expect(resp.body.questions[0].id).toEqual(question1.id)
        })

        it('should respond with 404 for student in unpublished lecture in section', async () => {
            const resp = await request(app).get(`/courses/${course.id}/lectures/${lecture1.id}`).set('Cookie', studentCookies)
            
            expect(resp.statusCode).toEqual(404)
        })

        it('should respond with 200, lecture info, and ONE question info for student in published lecture with one published question', async () => {
            const resp = await request(app).get(`/courses/${course_published.id}/lectures/${lecture2.id}`).set('Cookie', studentCookies)
            
            expect(resp.statusCode).toEqual(200)
            expect(resp.body.questions.length).toEqual(1)   // only 1 published question in this lecture
            expect(resp.body.questions[0].id).toEqual(question1.id)
        })

        it('should respond with 200, lecture info, and ZERO questions for student in published lecture but no published questions', async () => {
            const resp = await request(app).get(`/courses/${course_published.id}/lectures/${lecture1.id}`).set('Cookie', studentCookies)
            
            expect(resp.statusCode).toEqual(200)
            expect(resp.body.questions.length).toEqual(0)   // 0 published question in this lecture
        })

        it('should respond with 404 if lecture does not exist', async () => {
            const resp = await request(app).get(`/courses/${course.id}/lectures/${-1}`).set('Cookie', teacherCookies)
            
            expect(resp.statusCode).toEqual(404)
        })
    })

    describe('PUT /courses/:course_id/lectures/:lecture_id', () => {
        it('should respond with 401 for bad authorization token', async () => {
            const resp = await request(app).put(`/courses/${course.id}/lectures/${lecture1.id}`).send({
                description: "new cutting edge lecture"
            }).set('Cookie', 'waytoobadtoken')
            
            expect(resp.statusCode).toEqual(401)
        })

        it('should respond with 403 for someone who is not in course', async () => {
            const resp = await request(app).put(`/courses/${course.id}/lectures/${lecture1.id}`).send({
                description: "new cutting edge lecture"
            }).set('Cookie', unrelatedCookies)
            
            expect(resp.statusCode).toEqual(403)
        })

        it('should respond with 200 for teacher successfully updating lecture', async () => {     
            let new_desc = "new cutting edge lecture"
            const resp = await request(app).put(`/courses/${course.id}/lectures/${lecture1.id}`).send({
                description: new_desc
            }).set('Cookie', teacherCookies)
            
            expect(resp.statusCode).toEqual(200)

            // check if lecture was updated
            const check_lec = await db.Lecture.findOne({
                where: { id: lecture1.id }
            })           
            
            expect(check_lec.description).toEqual(new_desc)         
        })

        it('should respond with 200 for successful update but should not update the course id', async () => {     
            let new_desc = "even newer lecture"
            const resp = await request(app).put(`/courses/${course.id}/lectures/${lecture1.id}`).send({
                description: new_desc,
                courseId: course.id + 5
            }).set('Cookie', teacherCookies)
            
            expect(resp.statusCode).toEqual(200)

            // check if lecture was updated
            const check_lec = await db.Lecture.findOne({
                where: { id: lecture1.id }
            })           
            
            expect(check_lec.description).toEqual(new_desc) 
            expect(check_lec.courseId).toEqual(course.id)   // should be same course id as before, despite trying to update it       
        })

        it('should respond with 404 if lecture does not exist', async () => {
            const resp = await request(app).put(`/courses/${course.id}/lectures/${-1}`).set('Cookie', teacherCookies)
            
            expect(resp.statusCode).toEqual(404)
        })
    })

    describe('DELETE /courses/:course_id/lectures/:lecture_id', () => {
        it('should respond with 401 for bad authorization token', async () => {
            const resp = await request(app).delete(`/courses/${course.id}/lectures/${lecture1.id}`).set('Cookie', 'waytoobadtoken')
            
            expect(resp.statusCode).toEqual(401)
        })

        it('should respond with 403 for someone who is not in course', async () => {
            const resp = await request(app).delete(`/courses/${course.id}/lectures/${lecture1.id}`).set('Cookie', unrelatedCookies)
            
            expect(resp.statusCode).toEqual(403)
        })

        it('should respond with 204 if lecture does not exist (or is already deleted)', async () => {
            const resp = await request(app).delete(`/courses/${course.id}/lectures/${-1}`).set('Cookie', teacherCookies)
            
            expect(resp.statusCode).toEqual(204)
        })
        
        it('should respond with 403 for a non-teacher', async () => {
            const resp = await request(app).delete(`/courses/${course.id}/lectures/${lecture1.id}`).set('Cookie', studentCookies)
            
            expect(resp.statusCode).toEqual(403)
        })

        it('should delete the lecture, all relationships to this lecture, and return 204 upon successful delete', async () => {      
            const resp = await request(app).delete(`/courses/${course.id}/lectures/${lecture1.id}`).set('Cookie', teacherCookies)
            expect(resp.statusCode).toEqual(204)

            // check if lecture is deleted
            const check_lec_exists = await db.Lecture.findAll({
                where: { id: lecture1.id },
            })
            expect(check_lec_exists.length).toEqual(0)

            // check if lecture-question relationships are deleted
            const check_qs_lec_relation = await db.QuestionInLecture.findAll({
                where: { lectureId: lecture1.id },
            })
            expect(check_qs_lec_relation.length).toEqual(0)

            // check if lecture-section relationships are deleted
            const check_lec_sect_relation = await db.LectureForSection.findAll({
                where: { lectureId: lecture1.id },
            })
            expect(check_lec_sect_relation.length).toEqual(0)        
        })     
    })

    afterAll(async () => {
        await course.destroy()
        await course_published.destroy()
        await section1.destroy()
        await section2.destroy()
        await teacher.destroy()
        await student.destroy()
        await unrelated.destroy()
        await enrollment1.destroy()
        await enrollment2.destroy()
        await enrollment3.destroy()
        await lecture1.destroy()
        await lecture2.destroy()
        await lec1_sec1.destroy()
        await lec1_sec2.destroy()
        await lec2_sec1.destroy()
        await lec2_sec2.destroy()
        await question1.destroy()
        await question2.destroy()
        await q1_lec1.destroy()
        await q2_lec2.destroy()
        await q1_lec2.destroy()
    })
})
