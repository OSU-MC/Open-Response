const app = require('../../../app/app')
const db = require('../../../app/models')
const { generateUserSession } = require('../../../lib/auth')
const request = require('supertest')
const jwtUtils = require('../../../lib/jwt_utils')


describe('api/sections tests', () => {
    let teacher, teachEnroll, teachXsrfCookie, teachCookies
    let student, studentEnroll, studentXsrfCookie, studentCookies
    let course1
    let section1

    beforeAll(async() => {
        teacher = await db.User.create({
            firstName: 'Dan',
            lastName: 'Smith',
            email: 'dannySmith@myclassroom.com',
            rawPassword: 'Danny-o123!'
        })
        const teacherToken = jwtUtils.encode({
            sub: teacher.id
        })
        const teachSession = await generateUserSession(teacher)
        teachCookies = [`_myclassroom_session=${teacherToken}`, `xsrf-token=${teachSession.csrfToken}`]
        
        student = await db.User.create({
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@myclassroom.com',
            rawPassword: 'superdupersecret'
        })
        const studentToken = jwtUtils.encode({
            sub: student.id
        })
        const studentSession = await generateUserSession(student)
        studentCookies = [`_myclassroom_session=${studentToken}`, `xsrf-token=${studentSession.csrfToken}`]

        course1 = await db.Course.create({
            name: 'Capstone Course',
            description: 'Exploited labor'
        })

        section1 = await db.Section.create({
            number: 1,
            joinCode: "xyz123",
            courseId: course1.id
        })

        teachEnroll = await db.Enrollment.create({
            role: "teacher",
            courseId: course1.id,
            userId: teacher.id
        })

        studentEnroll = await db.Enrollment.create({
            role: "student",
            sectionId: section1.id,
            userId: student.id
        })
    })

    describe('POST /courses/:course_id/sections', () => {
        it('should respond with 400 for creating a section with already existing number', async () => {
            const resp = await request(app).post(`/courses/${course1.id}/sections`).send({
                number: 1
            }).set('Cookie', teachCookies)

            expect(resp.statusCode).toEqual(400)
        })

        it('should respond with 400 for creating a section with missing value', async () => {
            const resp = await request(app).post(`/courses/${course1.id}/sections`).send({
            }).set('Cookie', teachCookies)

            expect(resp.statusCode).toEqual(400)
        })

        it('should respond with 403 for creating a section as a student', async () => {
            const resp = await request(app).post(`/courses/${course1.id}/sections`).send({
                number: 2
            }).set('Cookie', studentCookies)

            expect(resp.statusCode).toEqual(403)
        })

        it('should respond with 201 for successfully creating section', async () => {
            const resp = await request(app).post(`/courses/${course1.id}/sections`).send({
                number: 2
            }).set('Cookie', teachCookies)

            expect(resp.statusCode).toEqual(201)
            expect(resp.body.section.courseId).toEqual(course1.id)
            expect(resp.body.section.number).toEqual(2)
        })
    })

    describe('GET /courses/:course_id/sections', () => {
        
        let courseToGetFrom     // create a seperate course for get from, so results aren't affected by prior tests
        let tempTeachEnroll
        beforeAll(async() => {
            courseToGetFrom = await db.Course.create({
                name: 'CS 160',
                description: 'Intro to CS'
            })
            // enroll as the teacher of this course
            tempTeachEnroll = await db.Enrollment.create({
                role: "teacher",
                courseId: courseToGetFrom.id,
                userId: teacher.id
            })
        })
    
        it('should respond with 403 for getting sections as a non teacher', async () => {
            const resp = await request(app).get(`/courses/${courseToGetFrom.id}/sections`).set('Cookie', studentCookies)

            expect(resp.statusCode).toEqual(403)
        })

        it('should respond with 204 for a course with no sections', async () => {
            const resp = await request(app).get(`/courses/${courseToGetFrom.id}/sections`).set('Cookie', teachCookies)

            expect(resp.statusCode).toEqual(204)
        })

        it('should respond with 200 for successfully getting sections', async () => {
            // create a section for courseToGetFrom
            const temp_section = await db.Section.create({
                number: 1,
                courseId: courseToGetFrom.id
            })
            
            const resp = await request(app).get(`/courses/${courseToGetFrom.id}/sections`).set('Cookie', teachCookies)

            expect(resp.statusCode).toEqual(200)
            expect(resp.body.length).toEqual(1)
            expect(resp.body[0].id).toEqual(temp_section.id)
            expect(resp.body[0].number).toEqual(temp_section.number)
            expect(resp.body[0].joinCode).toEqual(temp_section.joinCode)
        })
        
        afterAll(async () => {
            await courseToGetFrom.destroy()
            await tempTeachEnroll.destroy()
        })
    })

    describe('GET /courses/:course_id/sections/:section_id', () => {
        it('should respond with 404 for getting a section with bad section id', async () => {
            const resp = await request(app).get(`/courses/${course1.id}/sections/${-1}`).set('Cookie', teachCookies)

            expect(resp.statusCode).toEqual(404)
        })

        it('should respond with 403 for getting a section as a student', async () => {
            const resp = await request(app).get(`/courses/${course1.id}/sections/${section1.id}`).set('Cookie', studentCookies)

            expect(resp.statusCode).toEqual(403)
        })

        it('should respond with 400 for getting a section that is not in this course', async () => {
            // create temporary course, that will not hold any sections
            const temp_course = await db.Course.create({
                name: 'Temp Temp',
                description: 'Temp Temp Temp'
            })
            // enroll a teacher for this course
            await db.Enrollment.create({
                role: "teacher",
                courseId: temp_course.id,
                userId: teacher.id
            })

            const resp = await request(app).get(`/courses/${temp_course.id}/sections/${section1.id}`).set('Cookie', teachCookies)

            expect(resp.statusCode).toEqual(400)
        })

        it('should respond with 200 for successfully getting a course with provided lecture', async () => {
            // create lecture
            const temp_lec = await db.Lecture.create({
                title: 'question set 1',
                order: 1,
                description: 'intro qs',
                courseId: course1.id
            })
            // associate lecture with section
            const relation = await db.LectureForSection.create({
                lectureId: temp_lec.id,
                sectionId: section1.id,
            })
            
            const resp = await request(app).get(`/courses/${course1.id}/sections/${section1.id}`).set('Cookie', teachCookies)
            
            expect(resp.statusCode).toEqual(200)
            expect(resp.body.section.id).toEqual(section1.id)
            expect(resp.body.section.number).toEqual(section1.number)
            expect(resp.body.section.joinCode).toEqual(section1.joinCode)
            expect(resp.body.lectures.length).toEqual(1)
            expect(resp.body.lectures[0].id).toEqual(temp_lec.id)
            expect(resp.body.lectures[0].title).toEqual(temp_lec.title)
            expect(resp.body.lectures[0].published).toEqual(relation.published)
        })
    })

    describe('PUT /courses/:course_id/sections/:section_id', () => {
        
        let sectionToUpdate
        beforeAll(async() => {
            sectionToUpdate = await db.Section.create({
                number: 3,
                courseId: course1.id
            })
        })
        
        it('should respond with 400 for updating section with conflicting number', async () => {
            const resp = await request(app).put(`/courses/${course1.id}/sections/${sectionToUpdate.id}`).send({
                number: 1
            }).set('Cookie', teachCookies)
            
            expect(resp.statusCode).toEqual(400)
        })

        it('should respond with 400 for updating section with empty number', async () => {
            const resp = await request(app).put(`/courses/${course1.id}/sections/${sectionToUpdate.id}`).send({
                number: ""
            }).set('Cookie', teachCookies)
            
            expect(resp.statusCode).toEqual(400)
        })

        it('should respond with 400 for updating section with no number', async () => {
            const resp = await request(app).put(`/courses/${course1.id}/sections/${sectionToUpdate.id}`).send({
            }).set('Cookie', teachCookies)
            
            expect(resp.statusCode).toEqual(400)
        })
    
        it('should respond with 404 for updating section invalid id', async () => {
            const resp = await request(app).put(`/courses/${course1.id}/sections/${-1}`).send({
                number: 4
            }).set('Cookie', teachCookies)
            
            expect(resp.statusCode).toEqual(404)
        })

        it('should respond with 403 for updating section as a student', async () => {
            const resp = await request(app).put(`/courses/${course1.id}/sections/${sectionToUpdate.id}`).send({
                number: 4
            }).set('Cookie', studentCookies)
            
            expect(resp.statusCode).toEqual(403)
        })

        it('should respond with 400 for updating a section that is not in this course', async () => {
            // create temporary course, that will not hold any sections
            const temp_course = await db.Course.create({
                name: 'Temp Temp',
                description: 'Temp Temp Temp'
            })
            // enroll a teacher for this course
            await db.Enrollment.create({
                role: "teacher",
                courseId: temp_course.id,
                userId: teacher.id
            })

            const resp = await request(app).put(`/courses/${temp_course.id}/sections/${sectionToUpdate.id}`).send({
                number: 4
            }).set('Cookie', teachCookies)
            
            expect(resp.statusCode).toEqual(400)
        })

        it('should respond with 200 for successfully updating section', async () => {       
            const resp = await request(app).put(`/courses/${course1.id}/sections/${sectionToUpdate.id}`).send({
                number: 4
            }).set('Cookie', teachCookies)  

            expect(resp.statusCode).toEqual(200)
            
            // check if section was updated
            const check_sec = await db.Section.findOne({
                where: { id: sectionToUpdate.id }
            })
            expect(check_sec.number).toEqual(4)         
        })

        afterAll(async () => {
            await sectionToUpdate.destroy()
        })
    })

    afterAll(async () => {
        await teacher.destroy()
        await student.destroy()
        await course1.destroy()
        await section1.destroy()
        await studentEnroll.destroy()
        await teachEnroll.destroy()
    })
})
