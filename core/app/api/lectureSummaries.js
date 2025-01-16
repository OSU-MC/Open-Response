const router = require('express').Router({ mergeParams: true })
const db = require('../models/index')
const { requireAuthentication } = require('../../lib/auth')

// teacher or student is looking at the responses to questions given in a lecture
router.get('/', requireAuthentication, async function (req, res, next) {
    const user = await db.User.findByPk(req.payload.sub) // find user by ID, which is stored in sub
    const courseId = parseInt(req.params['course_id'])
    const sectionId = parseInt(req.params['section_id'])
    const lectureId = parseInt(req.params['lecture_id'])

    // check if user is a teacher for the course
    const enrollmentTeacher = await db.Enrollment.findOne({
        where: { 
            userId: user.id,
            courseId: courseId,
            role: 'teacher'
        }
    })

    // check if user is a student in the correct section for the correct course
    const enrollmentStudent = await db.Enrollment.findOne({
        where: { 
            role: 'student', 
            userId: user.id,
            sectionId: sectionId
        }
    })

    // check to make sure given section is part of the correct course
    const sectionCheck = await db.Section.findOne({
        where: {
            id: sectionId,
            courseId: courseId
        }
    })

    // if teacher makes request
    if (enrollmentTeacher) {
        try {
            // this will be the object in the API response
            // format:
            /* {
                [
                    {
                        average score,
                        number of responses,
                        question: question entity fields (id, stem, etc),
                        responses: [{
                            student name,
                            response: {
                                ...response fields (answer, score, etc)
                            }
                        },
                        ...
                        ]
                    },
                    ...
            ]}*/

            let resp = []
            // get all the questionInLectures for the given lecture
            const questionsInLecture = await db.QuestionInLecture.findAll({
                where: {
                    lectureId: lectureId
                }
            })
            // for each questionInLecture, get the question asked as well as an array of responses to it
            // complexity: roughly O(m * n) where m is the number of questions and n is the number of responses per question
            // this complexity calculation assumes database queries are roughly O(1), which may not be the case depending on database size
            for (let i = 0; i < questionsInLecture.length; i++) {
                const question = await db.Question.findByPk(questionsInLecture[i].questionId)
                const responses = await db.Response.findAll({
                    where: {
                        questionInLectureId: questionsInLecture[i].id
                    }
                })
                let questionArrayObj = {
                    numberOfResponses: responses.length,
                    question: question,
                    responses: []
                }
                let sum = 0 // sum of scores of responses, used to calculate average question score
                for (let j = 0; j < responses.length; j++) {
                    sum += responses[j].score
                    const student = await db.User.findOne({
                        include: [
                            {
                                model: db.Enrollment,
                                required: true,
                                include: [
                                    {
                                        model: db.Response,
                                        required: true,
                                        where: { id: responses[j].id }
                                    }
                                ]
                            }
                        ]
                    })
                    questionArrayObj.responses.push({
                        studentName: `${student.firstName} ${student.lastName}`,
                        response: responses[j]
                    })
                }
                // avoid divide by zero error, if no responses then just give average score of 0
                (responses.length !== 0) ? questionArrayObj.averageScore = parseFloat((sum / responses.length).toFixed(2)) : questionArrayObj.averageScore = 0
                resp.push(questionArrayObj)
            }

            res.status(200).send(resp)

        } catch (e) {
            next(e)
        }
    }
    // if student makes request
    else if (enrollmentStudent && sectionCheck) {
        try {
            // response format:
            /* 
            [
                {
                    question: question entity fields
                    response: student response to the question (which will have score as a field)
                },
                ...
            ]
            */

            let resp = []
            // get all the questionInLectures for the given lecture
            const questionsInLecture = await db.QuestionInLecture.findAll({
                where: {
                    lectureId: lectureId
                }
            })
            // for each questionInLecture, get the question asked and the student response
            // complexity: roughly O(m) where m is the number of questions
            // this complexity calculation assumes database queries are roughly O(1), which may not be the case depending on database size
            for (let i = 0; i < questionsInLecture.length; i++) {
                const question = await db.Question.findByPk(questionsInLecture[i].questionId)
                const response = await db.Response.findOne({
                    where: {
                        questionInLectureId: questionsInLecture[i].id,
                        enrollmentId: enrollmentStudent.id
                    }
                })
                // if the student answered this question
                if (response) {
                    resp.push({
                        question: question,
                        response: response
                    })
                }
                else {
                    resp.push({
                        question: question
                        // no response because one was not given by the student during the time the lecture was published
                        // on the frontend, check if the API response contains a "response" field, and if it doesn't then 
                        // (cont.) indicate to the user that there was no response for this question
                    })
                }
            }

            res.status(200).send(resp)

        } catch (e) {
            next(e)
        }
    }
    // if request is not by teacher or qualified student
    else {
        // **NOTE: You will also get this response if the url contains invalid numbers for any of the IDs present
        // (cont.) It is not worth the extra database queries to check if each part of the URL is valid (i.e. each lecture id is a valid lecture id for the section)
        // (cont.) If someone is playing around with the URL manually, giving a 403 should be fine
        res.status(403).send({ error: "User is neither the teacher for the course nor a student in the correct section of the course" })
    }
})

module.exports = router