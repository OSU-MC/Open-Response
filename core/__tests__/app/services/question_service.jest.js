const db = require('../../../app/models')
const QuestionService = require('../../../app/services/question_service')

describe("QuestionService.getQuestionScore", () => {

    let course

    beforeAll(async () => {
        course = await db.Course.create({
            name: "Question Testing Course"
        })
    })

    describe("type: multiple choice", () => {
        
        let question

        beforeAll(async() => {
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
        })

        it ("should score a 1 for correct answer", () => {
            submission = {
                answers: {
                    0: false,
                    1: true,
                    2: false,
                    3: false
                }
            }
            expect(QuestionService.getQuestionScore(question, submission)).toEqual(1.0)
        })

        it ("should score a 0 for incorrect answer", () => {
            submission = {
                answers: {
                    0: false,
                    1: false,
                    2: true,
                    3: false
                }
            }
            expect(QuestionService.getQuestionScore(question, submission)).toEqual(0.0)
        })

        afterAll(async () => {
            await question.destroy()
        })
    })

    describe("type: multiple answer", () => {

        let question

        beforeAll(async() => {
            question = await db.Question.create({
                type: 'multiple answer',
                stem: 'What is 1 + 2?',
                content: {
                    options: {
                        0: 2,
                        1: 3,
                        2: 3,
                        3: 3
                    }
                },
                answers: {
                    0: false,
                    1: true,
                    2: true,
                    3: true
                },
                courseId: course.id
            })
        })

        it ("should score a 1 for correct answer", () => {
            submission = {
                answers: {
                    0: false,
                    1: true,
                    2: true,
                    3: true
                }
            }
            expect(QuestionService.getQuestionScore(question, submission)).toEqual(1.0)
        })

        it ("should score a 0: 0 true positives, 0 false positives", () => {
            submission = {
                answers: {
                    0: false,
                    1: false,
                    2: false,
                    3: false
                }
            }
            expect(QuestionService.getQuestionScore(question, submission)).toEqual(0.0)
        })

        it ("should score a 0.33: 1 true positives, 0 false positives", () => {
            submission = {
                answers: {
                    0: false,
                    1: true,
                    2: false,
                    3: false
                }
            }
            expect(QuestionService.getQuestionScore(question, submission)).toEqual(0.33)
        })

        it ("should score a 0.66: 2 true positives, 0 false positives", () => {
            submission = {
                answers: {
                    0: false,
                    1: true,
                    2: true,
                    3: false
                }
            }
            expect(QuestionService.getQuestionScore(question, submission)).toEqual(0.67)
        })

        it ("should score a 0.66: 3 true positives, 1 false positives", () => {
            submission = {
                answers: {
                    0: true,
                    1: true,
                    2: true,
                    3: true
                }
            }
            expect(QuestionService.getQuestionScore(question, submission)).toEqual(0.67)
        })

        it ("should score a 0.33: 2 true positives, 1 false positives", () => {
            submission = {
                answers: {
                    0: true,
                    1: true,
                    2: false,
                    3: true
                }
            }
            expect(QuestionService.getQuestionScore(question, submission)).toEqual(0.33)
        })

        it ("should score a 0: 1 true positives, 1 false positives", () => {
            submission = {
                answers: {
                    0: true,
                    1: false,
                    2: false,
                    3: true
                }
            }
            expect(QuestionService.getQuestionScore(question, submission)).toEqual(0.0)
        })

        it ("should score a 0: 0 true positives, 1 false positives", () => {
            submission = {
                answers: {
                    0: true,
                    1: false,
                    2: false,
                    3: false
                }
            }
            expect(QuestionService.getQuestionScore(question, submission)).toEqual(0.0)
        })

        afterAll(async () => {
            await question.destroy()
        })
    })
    
    afterAll ( async () => {
        await course.destroy()
    })
})
