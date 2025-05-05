const app = require('../../../app/app')
const db = require('../../../app/models')
const { generateUserSession } = require('../../../lib/auth')
const request = require('supertest')
const jwtUtils = require('../../../lib/jwt_utils')

describe('Test api/lecturesForSection', () => {
    let teacher, teachEnroll, teachXsrfCookie, teachCookies
    let student, studentEnroll, studentXsrfCookie, studentCookies
    let course1
    let section1
    let lecture1
    let sec1_lec1

    beforeAll(async() => {
        teacher = await db.User.create({
            firstName: 'Dan',
            lastName: 'Smith',
            email: 'dannySmith@open-response.org',
            rawPassword: 'Danny-o123!'
        })
        const teacherToken = jwtUtils.encode({
            sub: teacher.id
        })
        const teachSession = await generateUserSession(teacher)
        teachCookies = [`_openresponse_session=${teacherToken}`, `xsrf-token=${teachSession.csrfToken}`]
        
        student = await db.User.create({
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@open-response.org',
            rawPassword: 'superdupersecret'
        })
        const studentToken = jwtUtils.encode({
            sub: student.id
        })
        const studentSession = await generateUserSession(student)
        studentCookies = [`_openresponse_session=${studentToken}`, `xsrf-token=${studentSession.csrfToken}`]

        course1 = await db.Course.create({
            name: 'Capstone Course',
            description: 'Exploited labor'
        })

        section1 = await db.Section.create({
            number: 1,
            joinCode: "xyz123",
            courseId: course1.id
        })

        lecture1 = await db.Lecture.create({
            title: 'question set 1',
            order: 1,
            description: 'intro qs',
            courseId: course1.id
        })

        sec1_lec1 = await db.LectureForSection.create({
            sectionId: section1.id,
            attendanceMethod: 'join',
            lectureId: lecture1.id
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

    describe('PUT /courses/:course_id/sections/:section_id/lectures/:lecture_id', () => {        
        it('should respond with 403 for updating as a student', async () => {
            const resp = await request(app).put(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecture1.id}`).set('Cookie', studentCookies)

            expect(resp.statusCode).toEqual(403)
        })

        it('should respond with 404 for updating a section id that does not exist', async () => {
            const resp = await request(app).put(`/courses/${course1.id}/sections/-1/lectures/${lecture1.id}`).set('Cookie', teachCookies)

            expect(resp.statusCode).toEqual(404)
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
            
            const resp = await request(app).put(`/courses/${temp_course.id}/sections/${section1.id}/lectures/${lecture1.id}`).set('Cookie', teachCookies)

            expect(resp.statusCode).toEqual(400)
        })

        it('should respond with 400 for updating when there is no relationship between section and lecture', async () => {
            const tempLec = await db.Lecture.create({
                title: 'temp lec',
                order: 2,
                description: 'temp qqq',
                courseId: course1.id
            })            
            const resp = await request(app).put(`/courses/${course1.id}/sections/${section1.id}/lectures/${tempLec.id}`).set('Cookie', teachCookies)

            expect(resp.statusCode).toEqual(400)
        })

        it('should respond with 200 for successfully updating published status of lectureForSection', async () => {
            const origPublishedStatus = sec1_lec1.published

            let resp = await request(app).put(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecture1.id}`).set('Cookie', teachCookies)
            expect(resp.statusCode).toEqual(200)

            // get the updated relationship and check that the published status is opposite of the original
            let check_relation = await db.LectureForSection.findByPk(sec1_lec1.id)
            expect(check_relation.published).toEqual(!origPublishedStatus)

            // call again to revert the change
            resp = await request(app).put(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecture1.id}`).set('Cookie', teachCookies)
            expect(resp.statusCode).toEqual(200)

            // ensure status is back to original
            check_relation = await db.LectureForSection.findByPk(sec1_lec1.id)
            expect(check_relation.published).toEqual(origPublishedStatus)
        })
    })

    describe('GET /courses/:course_id/sections/:section_id/lectures/:lecture_id/questions', () => {
        it('should respond with 403 for fetching questions as a student', async () => {
            const resp = await request(app)
                .get(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecture1.id}/questions`)
                .set('Cookie', studentCookies);

            expect(resp.statusCode).toEqual(403);
        });

        it('should respond with 404 for fetching questions from a non-existent section', async () => {
            const resp = await request(app)
                .get(`/courses/${course1.id}/sections/-1/lectures/${lecture1.id}/questions`)
                .set('Cookie', teachCookies);

            expect(resp.statusCode).toEqual(404);
        });

        it('should respond with 404 for fetching questions from a lecture not in the course', async () => {
            const tempLecture = await db.Lecture.create({
                title: 'Temp Lecture',
                order: 3,
                description: 'Temporary lecture',
                courseId: course1.id,
            });

            const resp = await request(app)
                .get(`/courses/${course1.id}/sections/${section1.id}/lectures/${tempLecture.id}/questions`)
                .set('Cookie', teachCookies);

            expect(resp.statusCode).toEqual(404);

            await tempLecture.destroy();
        });

        it('should respond with 404 for fetching questions when LectureForSection does not exist', async () => {
            const tempLecture = await db.Lecture.create({
                title: 'Temp Lecture',
                order: 4,
                description: 'Temporary lecture',
                courseId: course1.id,
            });

            const resp = await request(app)
                .get(`/courses/${course1.id}/sections/${section1.id}/lectures/${tempLecture.id}/questions`)
                .set('Cookie', teachCookies);

            expect(resp.statusCode).toEqual(404);

            await tempLecture.destroy();
        });

        it('should respond with 200 and return questions for a valid request', async () => {
            const question1 = await db.Question.create({
                lectureId: lecture1.id,
                totalPoints: 1,
                order: 5,
                softdelete: false, 
                type: "multiple choice",
                stem: "what is the answer",
            })

            const question2 = await db.Question.create({
                lectureId: lecture1.id,
                totalPoints: 1,
                order: 4,
                softdelete: false, 
                type: "multiple choice",
                stem: "dog frog",
            })

            await db.QuestionInLecture.create({
                lectureForSectionId: sec1_lec1.id,
                questionId: question1.id,
                published: true,
            });

            await db.QuestionInLecture.create({
                lectureForSectionId: sec1_lec1.id,
                questionId: question2.id,
                published: true,
            });

            const resp = await request(app)
                .get(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecture1.id}/questions`)
                .set('Cookie', teachCookies);

            expect(resp.statusCode).toEqual(200);
            expect(resp.body.questions).toHaveLength(2);
            expect(resp.body.questions).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ stem: 'what is the answer' }),
                    expect.objectContaining({ stem: 'dog frog' }),
                ])
            );

            await question1.destroy();
            await question2.destroy();
        });
    })

    afterAll(async () => {
        await teacher.destroy()
        await student.destroy()
        await course1.destroy()
        await section1.destroy()
        await studentEnroll.destroy()
        await teachEnroll.destroy()
        await lecture1.destroy()
        await sec1_lec1.destroy()
    })
})
