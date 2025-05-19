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

    describe('POST /courses/:course_id/sections/:section_id/lectures', () => {
        let lecture2;
        beforeAll(async () => {
        // Find the max order for lectures in course1 to avoid unique constraint errors
            const maxOrder = await db.Lecture.max('order', { where: { courseId: course1.id } }) || 1;
            lecture2 = await db.Lecture.create({
                title: 'Second Lecture',
                order: maxOrder + 1,
                description: 'desc',
                courseId: course1.id
            });
            // Add a question to lecture2
            const question1 = await db.Question.create({
                lectureId: lecture2.id,
                totalPoints: 2,
                order: 5,
                softdelete: false, 
                type: "multiple choice",
                stem: "what is the answer",
            })
        });

        afterAll(async () => {
            await db.Question.destroy({ where: { lectureId: lecture2.id } });
            await lecture2.destroy();
        });

        it('should return 403 if not a teacher', async () => {
            const resp = await request(app)
                .post(`/courses/${course1.id}/sections/${section1.id}/lectures`)
                .set('Cookie', studentCookies)
                .send({ lectureId: lecture2.id, attendanceMethod: 'join', weight: 1 });
            expect(resp.statusCode).toBe(403);
        });

        it('should return 404 if section does not exist', async () => {
            const resp = await request(app)
                .post(`/courses/${course1.id}/sections/99999/lectures`)
                .set('Cookie', teachCookies)
                .send({ lectureId: lecture2.id, attendanceMethod: 'join', weight: 1 });
            expect(resp.statusCode).toBe(404);
        });

        it('should return 404 if lecture does not exist', async () => {
            const resp = await request(app)
                .post(`/courses/${course1.id}/sections/${section1.id}/lectures`)
                .set('Cookie', teachCookies)
                .send({ lectureId: 99999, attendanceMethod: 'join', weight: 1 });
            expect(resp.statusCode).toBe(404);
        });

        it('should return 400 if lecture already exists in section', async () => {
            // sec1_lec1 already links lecture1 and section1
            const resp = await request(app)
                .post(`/courses/${course1.id}/sections/${section1.id}/lectures`)
                .set('Cookie', teachCookies)
                .send({ lectureId: lecture1.id, attendanceMethod: 'join', weight: 1 });
            expect(resp.statusCode).toBe(400);
        });

        it('should return 400 if required fields are missing', async () => {
            const resp = await request(app)
                .post(`/courses/${course1.id}/sections/${section1.id}/lectures`)
                .set('Cookie', teachCookies)
                .send({ attendanceMethod: 'join', weight: 1 });
            expect(resp.statusCode).toBe(400);
        });

        it('should create lectureForSection, questionsInLecture, and lectureGradeWeight (int/float/zero weight)', async () => {
            // Use lecture2 and section1 (should not exist yet)
            // Int weight
            let resp = await request(app)
                .post(`/courses/${course1.id}/sections/${section1.id}/lectures`)
                .set('Cookie', teachCookies)
                .send({ lectureId: lecture2.id, attendanceMethod: 'join', weight: 2 });

            expect(resp.statusCode).toBe(200);
            let lfs = await db.LectureForSection.findOne({ where: { sectionId: section1.id, lectureId: lecture2.id } });
            expect(lfs).not.toBeNull();
            let qil = await db.QuestionInLecture.findAll({ where: { lectureForSectionId: lfs.id } });
            expect(qil.length).toBe(1);
            let weight = await db.LectureGradeWeight.findOne({ where: { LectureForSectionId: lfs.id } });
            expect(weight).not.toBeNull();
            expect(weight.weight).toBe(2);

            // Float weight
            const section2 = await db.Section.create({ number: 99, joinCode: 'float6', courseId: course1.id });
            resp = await request(app)
                .post(`/courses/${course1.id}/sections/${section2.id}/lectures`)
                .set('Cookie', teachCookies)
                .send({ lectureId: lecture2.id, attendanceMethod: 'join', weight: 1.5 });
            expect(resp.statusCode).toBe(200);
            lfs = await db.LectureForSection.findOne({ where: { sectionId: section2.id, lectureId: lecture2.id } });
            weight = await db.LectureGradeWeight.findOne({ where: { LectureForSectionId: lfs.id } });
            expect(weight.weight).toBeCloseTo(1.5);

            // Zero weight
            const section3 = await db.Section.create({ number: 100, joinCode: 'zero00', courseId: course1.id });
            resp = await request(app)
                .post(`/courses/${course1.id}/sections/${section3.id}/lectures`)
                .set('Cookie', teachCookies)
                .send({ lectureId: lecture2.id, attendanceMethod: 'join', weight: 0 });
            expect(resp.statusCode).toBe(200);
            lfs = await db.LectureForSection.findOne({ where: { sectionId: section3.id, lectureId: lecture2.id } });
            weight = await db.LectureGradeWeight.findOne({ where: { LectureForSectionId: lfs.id } });
            expect(weight.weight).toBe(0);

            await section2.destroy();
            await section3.destroy();
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
