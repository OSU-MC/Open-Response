const app = require('../../../app/app')
const db = require('../../../app/models')
const { generateUserSession } = require('../../../lib/auth')
const request = require('supertest')
const jwtUtils = require('../../../lib/jwt_utils')
const { where } = require('sequelize')

describe('Test api/questionsInLecture', () => {
    let teacher, teachEnroll, teachXsrfCookie, teachCookies
    let student, studentEnroll, studentXsrfCookie, studentCookies
    let course1
    let section1
    let lecture
    let question1
    let question2
    let q1_lec1
    let sec1_lec1 // Define sec1_lec1 here

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

        lecture = await db.Lecture.create({
            title: 'question set 1',
            order: 1,
            description: 'intro qs',
            courseId: course1.id
        })

        sec1_lec1 = await db.LectureForSection.create({
            sectionId: section1.id,
            attendanceMethod: 'join',
            lectureId: lecture.id,
            published: true,
            softdelete: false
        });

        question1 = await db.Question.create({
            lectureId: lecture.id,
            totalPoints: 1,
            order: 5,
            softdelete: false, 
            type: "multiple choice",
            stem: "what is the answer",
        })

        q1_lec1 = await db.QuestionInLecture.create({
            questionId: question1.id,
            lectureForSectionId: sec1_lec1.id,
            published: true
        })

        question2 = await db.Question.create({
            lectureId: lecture.id,
            totalPoints: 1,
            order: 5,
            softdelete: false, 
            type: "multiple choice",
            stem: "not initially linked to lecture",
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

    describe('GET /courses/:course_id/sections/:section_id/lectures/:lecture_id/questions/:question_id', () => {        
        it('should respond with 403 for getting a question as a student', async () => {
            const resp = await request(app).get(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecture.id}/questions/${question1.id}`).set('Cookie', studentCookies)

            expect(resp.statusCode).toEqual(403)
        })

        it('should respond with 400 for getting a question in lecture that is not in this course', async () => {
            // create course to put new lecture in (will not be calling api using this course)
            const randomCourse = await db.Course.create({
                name: 'Random Course',
                description: 'rando'
            })
            const lecNotInCourse = await db.Lecture.create({
                title: 'not in course',
                order: 1,
                description: 'abc',
                courseId: randomCourse.id
            })
            
            const tempSection = await db.Section.create({
                number: 1,
                joinCode: "xyz123",
                courseId: randomCourse.id
            });
            
            const tempLecForSections = await db.LectureForSection.create({
                sectionId: tempSection.id,
                attendanceMethod: 'join',
                lectureId: lecNotInCourse.id,
                published: true,
                softdelete: false
            });

            // put question1 in this lecture (to not trigger any other error)
            await db.QuestionInLecture.create({
                questionId: question1.id,
                lectureForSectionId: tempLecForSections.id,
                published: true
            })

            // call GET using course1 and lecNotInCourse
            const resp = await request(app).get(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecNotInCourse.id}/questions/${question1.id}`).set('Cookie', teachCookies)

            expect(resp.statusCode).toEqual(400)
        })

        it('should respond with 400 for getting a question not in a lecture', async () => {
            qsNotInLec = null        
            const resp = await request(app).get(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecture.id}/questions/${qsNotInLec}`).set('Cookie', teachCookies)

            expect(resp.statusCode).toEqual(400)
        })

        // TODO need to correct
        it('should respond with 404 for getting a question that does not exist in this course', async () => {
            const tempCourse = await db.Course.create({
                name: 'Temp Course',
                description: 'tamp'
            })         
            const lecture1 = await db.Lecture.create({
                title: 'not in course',
                order: 1,
                description: 'abc',
                courseId: tempCourse.id
            })
            const tempSection = await db.Section.create({
                number: 1,
                joinCode: "xyz123",
                courseId: tempCourse.id
            });
            const tempLecForSections = await db.LectureForSection.create({
                sectionId: tempSection.id,
                attendanceMethod: 'join',
                lectureId: lecture1.id,
                published: true,
            })
            // create question that is not in course1
            const qsNotInCourse = await db.Question.create({
                lectureId: lecture.id,
                type: "multiple choice",
                stem: "was this in the course",
            })
            
            // put qsNotInCourse in this lecture1 (to not trigger any other error)
            await db.QuestionInLecture.create({
                questionId: qsNotInCourse.id,
                lectureForSectionId: tempLecForSections.id,
                published: true
            })

            const resp = await request(app).get(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecture.id}/questions/${qsNotInCourse.id}`).set('Cookie', teachCookies)

            expect(resp.statusCode).toEqual(404)
        })


        it('should respond with 200 for successfully getting a question', async () => {                           
            
            const resp = await request(app).get(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecture.id}/questions/${question1.id}`).set('Cookie', teachCookies)

            expect(resp.statusCode).toEqual(200)
            expect(resp.body.id).toEqual(question1.id)
            // question no longer has this relationship to course            
            // expect(resp.body.courseId).toEqual(course1.id) 
            expect(resp.body.type).toEqual(question1.type)
            expect(resp.body.stem).toEqual(question1.stem)
            expect(resp.body.lectureId).toEqual(lecture.id)
            expect(resp.body.order).toEqual(q1_lec1.order)
            expect(resp.body.published).toEqual(q1_lec1.published)
        })
    })

    // note: only different type of test is response 200 (all other validation testing is the same here)
    describe('PUT /courses/:course_id/lectures/:lecture_id/questions/:question_id', () => {        
        it('should respond with 403 for updating a question as a student', async () => {
            const resp = await request(app).put(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecture.id}/questions/${question1.id}`).set('Cookie', studentCookies)

            expect(resp.statusCode).toEqual(403)
        })

        
        it('should respond with 404 for updating a question in lecture that is not in this course', async () => {
            // create course to put new lecture in (will not be calling api using this course)
            const randomCourse = await db.Course.create({
                name: 'Random Course',
                description: 'rando'
            })
            const lecNotInCourse = await db.Lecture.create({
                title: 'not in course',
                order: 1,
                description: 'abc',
                courseId: randomCourse.id
            })
            
            const tempSection = await db.Section.create({
                number: 1,
                joinCode: "xyz123",
                courseId: randomCourse.id
            });
            const tempLecForSections = await db.LectureForSection.create({
                sectionId: tempSection.id,
                attendanceMethod: 'join',
                lectureId: lecNotInCourse.id,
                published: true,
                softdelete: false
            });

            // put question1 in this lecture (to not trigger any other error)
            await db.QuestionInLecture.create({
                questionId: question1.id,
                lectureForSectionId: tempLecForSections.id,
                published: true
            })

            // call GET using course1 and lecNotInCourse
            const resp = await request(app).put(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecNotInCourse.id}/questions/${question1.id}`).set('Cookie', teachCookies)

            expect(resp.statusCode).toEqual(404)
        })

        it('should respond with 404 for updating a question not in given lecture', async () => {
            
            const lecture3 = await db.Lecture.create({
                title: 'dog',
                order: 13,
                description: 'abc',
                courseId: course1.id
            })
        

            qsNotInLec = await db.Question.create({
                courseId: course1.id,   // in course1, but just not in lecture
                type: "multiple choice",
                lectureId: lecture3.id,
                totalPoints: 1,
                order: 5,
                softdelete: false, 
                stem: "was this in lecture",
            })            
            const resp = await request(app).put(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecture.id}/questions/${qsNotInLec.id}`).set('Cookie', teachCookies)

            // questions should not be able to be updated if not in lecture
            expect(resp.statusCode).toEqual(404)
        })
        
        
        it('should respond with 404 for updating a question that does not exist in this course', async () => {
            const tempCourse = await db.Course.create({
                name: 'Temp Course',
                description: 'tamp'
            })
            // create question that is not in course1
            const qsNotInCourse = await db.Question.create({
                lectureId: lecture.id,
                totalPoints: 1,
                order: 5,
                softdelete: false, 
                type: "multiple choice",
                stem: "was this in the course",
            })
            
            const tempSection = await db.Section.create({
                number: 1,
                joinCode: "xyz123",
                courseId: tempCourse.id
            });
            const tempLecForSections = await db.LectureForSection.create({
                sectionId: tempSection.id,
                attendanceMethod: 'join',
                lectureId: lecture.id,
                published: true,
                softdelete: false
            });

            // put qsNotInCourse in this lecture (to not trigger any other error)
            await db.QuestionInLecture.create({
                questionId: qsNotInCourse.id,
                lectureForSectionId: tempLecForSections.id,
                published: true
            })

            const resp = await request(app).put(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecture.id}/questions/${qsNotInCourse.id}`).set('Cookie', teachCookies)
            // changed to 400 beacuse a question should be update-able if it is not in the course
            expect(resp.statusCode).toEqual(404)
        })

        it('should respond with 200 for successfully updating the published status of a question', async () => {        
            const initialPublishedStatus = q1_lec1.published
            
            let resp = await request(app).put(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecture.id}/questions/${question1.id}`).set('Cookie', teachCookies)
            expect(resp.statusCode).toEqual(200)

            // get from database to see if it was updated
            let check_relation = await db.QuestionInLecture.findOne({
                where: { id: q1_lec1.id },
                attributes: { exclude: ['LectureId'] } 
            });
            expect(check_relation.published).toEqual(!(initialPublishedStatus)) // should be opposite of initial published status

            // call again to ensure the published status goes back to original            
            resp = await request(app).put(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecture.id}/questions/${question1.id}`).set('Cookie', teachCookies)
            expect(resp.statusCode).toEqual(200)

            check_relation = await db.QuestionInLecture.findOne({
                where: { id: q1_lec1.id },
                attributes: { exclude: ['LectureId'] } 
            });
            expect(check_relation.published).toEqual(initialPublishedStatus)    // should have gone back or original status
        })
    })

    describe('POST /courses/:course_id/lectures/:lecture_id/questions/:question_id', () => {        
        it('should respond with 201 for linking question to lecture', async () => {                    
            let resp = await request(app).post(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecture.id}/questions/${question2.id}`).set('Cookie', teachCookies)
            
            expect(resp.statusCode).toEqual(201)
            expect(resp.body.questionId).toEqual(question2.id)
            expect(resp.body.lectureId).toEqual(lecture.id)
        })

        it('should respond with 403 for linking a question as a student', async () => {
            let resp = await request(app).post(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecture.id}/questions/${question2.id}`).set('Cookie', studentCookies)

            expect(resp.statusCode).toEqual(403)
        })

        it('should respond with 400 for updating a question in lecture that is not in this course', async () => {
            // create course to put new lecture in (will not be calling api using this course)
            const randomCourse = await db.Course.create({
                name: 'Random Course',
                description: 'rando'
            })
            const lecNotInCourse = await db.Lecture.create({
                title: 'not in course',
                order: 1,
                description: 'abc',
                courseId: randomCourse.id
            })
            
            const tempSection = await db.Section.create({
                number: 1,
                joinCode: "xyz123",
                courseId: randomCourse.id
            });
            const tempLecForSections = await db.LectureForSection.create({
                sectionId: tempSection.id,
                attendanceMethod: 'join',
                lectureId: lecture.id,
                published: true,
                softdelete: false
            });

            // put question1 in this lecture (to not trigger any other error)
            await db.QuestionInLecture.create({
                questionId: question1.id,
                lectureForSectionId: tempLecForSections.id,
                published: true
            })

            // call GET using course1 and lecNotInCourse
            const resp = await request(app).post(`/courses/${course1.id}/sections/${tempSection.id}/lectures/${lecNotInCourse.id}/questions/${question1.id}`).set('Cookie', teachCookies)

            expect(resp.statusCode).toEqual(400)
        })

        it('should respond with 201 for linking question to lecture with body', async () => {                    
            // delete previous relationships to allow this one to be created
            
            const createdRel = await db.QuestionInLecture.findOne({
                where: {
                    lectureForSectionId: sec1_lec1.id,
                    questionId: question2.id
                },
                attributes: { exclude: ['LectureId'] }
            })
            await createdRel.destroy()

            let resp = await request(app).post(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecture.id}/questions/${question2.id}`).send({
                published: true
            }).set('Cookie', teachCookies)
            
            expect(resp.statusCode).toEqual(201)
            expect(resp.body.questionId).toEqual(question2.id)
            expect(resp.body.lectureId).toEqual(lecture.id)
            expect(resp.body.published).toEqual(true)
        })
    })

    describe('PUT /courses/:course_id/lectures/:lecture_id/questions', () => {   
        it('should respond with 400 if not providing both question IDs in body', async () => {
            const resp = await request(app).put(`/courses/${course1.id}/lectures/${lecture.id}/questions`).send({
            }).set('Cookie', teachCookies)

            expect(resp.statusCode).toEqual(400)
        })

        it('should respond with 400 if only providing one question ID in body', async () => {
            const resp = await request(app).put(`/courses/${course1.id}/lectures/${lecture.id}/questions`).send({
                questionIdOne: 1
            }).set('Cookie', teachCookies)

            expect(resp.statusCode).toEqual(400)
        })
        
        it('should respond with 403 for updating a question as a student', async () => {
            const resp = await request(app).put(`/courses/${course1.id}/lectures/${lecture.id}/questions`).send({
                questionIdOne: 1,
                questionIdTwo: 2
            }).set('Cookie', studentCookies)

            expect(resp.statusCode).toEqual(403)
        })

        it('should respond with 400 for updating when lecture is not in course', async () => {
            // create course to put new lecture in (will not be calling api using this course)
            const randomCourse = await db.Course.create({
                name: 'Random Course',
                description: 'rando'
            })
            const lecNotInCourse = await db.Lecture.create({
                title: 'not in course',
                order: 1,
                description: 'abc',
                courseId: randomCourse.id
            })
            
            const tempSection = await db.Section.create({
                number: 1,
                joinCode: "xyz123",
                courseId: randomCourse.id
            });
            const tempLecForSections = await db.LectureForSection.create({
                sectionId: tempSection.id,
                attendanceMethod: 'join',
                lectureId: lecture.id,
                published: true,
                softdelete: false
            });

            // put question1 in this lecture (to not trigger any other error)
            await db.QuestionInLecture.create({
                questionId: question1.id,
                lectureForSectionId: tempLecForSections.id,
                published: true
            })

            // call PUT using course1 and lecNotInCourse
            const resp = await request(app).put(`/courses/${course1.id}/lectures/${lecNotInCourse.id}/questions`).send({
                questionIdOne: 1,
                questionIdTwo: 2
            }).set('Cookie', teachCookies)

            expect(resp.statusCode).toEqual(400)
        })

        it('should respond with 400 for updating when one of the questions in not in lecture', async () => {
            qsNotInLec = await db.Question.create({
                courseId: course1.id,   // in course1, but just not in lecture
                lectureId: lecture.id,
                totalPoints: 1,
                order: 5,
                softdelete: false, 
                type: "multiple choice",
                stem: "was this in lecture",
            })            
            const resp = await request(app).put(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecture.id}/questions`).send({
                questionIdOne: question1.id,    // this question is in lecture
                questionIdTwo: qsNotInLec.id    // not in lecture
            }).set('Cookie', teachCookies)

            expect(resp.statusCode).toEqual(400)
        })

        
        it('should respond with 200 for swapping the ordering of two questions', async () => {
            // create question that will swap order with question1
            const tempQ = await db.Question.create({
                courseId: course1.id,
                lectureId: lecture.id,
                totalPoints: 1,
                order: 5,
                softdelete: false, 
                type: "multiple choice",
                stem: "temp order",
            })
            const tempLecRelation = await db.QuestionInLecture.create({
                questionId: tempQ.id,
                lectureForSectionId: sec1_lec1.id,
                published: true
            })

            // extract original orders before modifying
            const origQ1Order = q1_lec1.order
            const origTempQOrder = tempLecRelation.order

            const resp = await request(app).put(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecture.id}/questions`).send({
                questionIdOne: question1.id,
                questionIdTwo: tempQ.id
            }).set('Cookie', teachCookies)

            expect(resp.statusCode).toEqual(200)

            // check if orders were successfully swapped
            const checkQ1order = await db.QuestionInLecture.findOne({where: {id: q1_lec1.id}, attributes: { exclude: ['LectureId'] }})
            expect(checkQ1order.order).toEqual(origTempQOrder)

            const checkTempQOrder = await db.QuestionInLecture.findOne({where: {id: tempLecRelation.id}, attributes: { exclude: ['LectureId'] }})
            expect(checkTempQOrder.order).toEqual(origQ1Order)
        })
    })

    describe('DELETE /courses/:course_id/lectures/:lecture_id/questions/:question_id', () => {   
        it('should respond with 403 for deleting a question as a student', async () => {
            const resp = await request(app).delete(`/courses/${course1.id}/lectures/${lecture.id}/questions/${question1.id}`).set('Cookie', studentCookies)

            expect(resp.statusCode).toEqual(403)
        })

        it('should respond with 400 for deleting a lecture that not in course', async () => {
            // create course to put new lecture in (will not be calling api using this course)
            const randomCourse = await db.Course.create({
                name: 'Random Course',
                description: 'rando'
            })
            const tempSection = await db.Section.create({
                number: 1,
                joinCode: "xyz123",
                courseId: randomCourse.id
            });
            const lecNotInCourse = await db.Lecture.create({
                title: 'not in course',
                order: 1,
                description: 'abc',
                courseId: randomCourse.id
            })
            const tempLecForSections = await db.LectureForSection.create({
                sectionId: tempSection.id,
                attendanceMethod: 'join',
                lectureId: lecNotInCourse.id,
            });
            
            // put question1 in this lecture (to not trigger any other error)
            await db.QuestionInLecture.create({
                questionId: question1.id,
                lectureForSectionId: tempLecForSections.id,
                published: true
            })

            // call DELETE using course1 and lecNotInCourse
            const resp = await request(app).delete(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecNotInCourse.id}/questions/${question1.id}`).set('Cookie', teachCookies)

            expect(resp.statusCode).toEqual(400)
        })

        it('should respond with 400 for deleting a question not in lecture', async () => {
            qsNotInLec = await db.Question.create({
                courseId: course1.id,   // in course1, but just not in lecture
                lectureId: lecture.id,
                totalPoints: 1,
                order: 5,
                softdelete: false, 
                type: "multiple choice",
                stem: "was this in lecture",
            })
            const resp = await request(app).delete(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecture.id}/questions/${qsNotInLec.id}`).set('Cookie', teachCookies)

            expect(resp.statusCode).toEqual(400)
        })

        it('should respond with 400 for deleting question not in course', async () => {
            // create question that is not in course1
            const qsNotInCourse = await db.Question.create({
                lectureId: lecture.id,
                totalPoints: 1,
                order: 5,
                softdelete: false, 
                type: "multiple choice",
                stem: "was this in the course",
            })
            
            const tempCourse = await db.Course.create({
                name: 'Temp Course',
                description: 'temp'
            });

            const tempSection = await db.Section.create({
                number: 1,
                joinCode: "xyz123",
                courseId: tempCourse.id
            });
            const tempLecForSections = await db.LectureForSection.create({
                sectionId: tempSection.id,
                attendanceMethod: 'join',
                lectureId: lecture.id,
                published: true,
                softdelete: false
            });

            // put qsNotInCourse in this lecture (to not trigger any other error)
            await db.QuestionInLecture.create({
                questionId: qsNotInCourse.id,
                lectureForSectionId: tempLecForSections.id,
                published: true
            })

            const resp = await request(app).delete(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecture.id}/questions/${qsNotInCourse.id}`).set('Cookie', teachCookies)
            // change to 400 because request to delete a question not in a course should not be possible
            expect(resp.statusCode).toEqual(400)
        })

        it('should respond with 204 for successfully removing a question from lecture', async () => {
            // ensure that question1 is in lecture
            const preDelete = await db.QuestionInLecture.findOne({where: { id: q1_lec1.id }, attributes: { exclude: ['LectureId'] }})
            
            expect(preDelete).toBeTruthy()
            
            const resp = await request(app).delete(`/courses/${course1.id}/sections/${section1.id}/lectures/${lecture.id}/questions/${question1.id}`).set('Cookie', teachCookies)
            expect(resp.statusCode).toEqual(204)

            // same call as before but now question1 shouldn't be in lecture
            const deletedQs = await db.QuestionInLecture.findOne({where: { id: q1_lec1.id }, attributes: { exclude: ['LectureId'] }})
            expect(deletedQs).toBeFalsy()
        })
    })

    afterAll(async () => {
        await teacher.destroy()
        await student.destroy()
        await course1.destroy()
        await section1.destroy()
        await studentEnroll.destroy()
        await teachEnroll.destroy()
        await lecture.destroy()
        await question1.destroy()
        await question2.destroy()
        await q1_lec1.destroy()
    })
})
