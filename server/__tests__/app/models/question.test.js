const db = require('../../../app/models')
const { ForeignKeyConstraintError, ValidationError } = require('sequelize')

describe("Question model", () => {

    let lecture

    beforeAll(async () => {
        const course = await db.Course.create({
            name: "Test Course 1",
            description: "A course for testing the things!"
        })
        lecture = await db.Lecture.create({
            title: "Lecture 1",
            description: "An introduction to testing",
            courseId: course.id
        })
    })

    describe("Question.create", () => {

        let question

        it("should invalidate the type because it does not exist", async () => {
            await expect(db.Question.create({
                type: 'graphing',
                stem: 'Graph y = x + 1',
                content: {},
                answers: {},
                lectureId: lecture.id
            })).rejects.toThrow("Validation error: Question type is not a valid option")
        })

        it("should invalidate because a stem was not provided", async () => {
            await expect(db.Question.create({
                type: 'multiple answer',
                content: {},
                answers: {},
                lectureId: lecture.id
            })).rejects.toThrow("notNull Violation: Question stem text must be provided")
        })

        it("should invalidate because the stem provided was empty", async () => {
            await expect(db.Question.create({
                type: 'multiple answer',
                stem: '  ',
                content: {},
                answers: {},
                lectureId: lecture.id
            })).rejects.toThrow("Validation error: Question stem text must be provided")
        })

        it("should invalidate because no lectureId was provided", async () => {
            await expect(db.Question.create({
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
            })).rejects.toThrow("notNull Violation: Question must have a lecture")
        })

        it("should invalidate because no lecture with lectureId exists", async () => {
            await expect(db.Question.create({
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
                lectureId: lecture.id + 1
            })).rejects.toThrow(ForeignKeyConstraintError)
        })

        it("should create a valid multiple choice question with default values", async () => {
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
                lectureId: lecture.id
            })
            question = await question.reload()
            expect(question.type).toEqual('multiple choice')
            expect(question.stem).toEqual('What is 1 + 2?')
            expect(question.content.options).not.toBeNull()
            expect(question.totalPoints).toEqual(1.0) // Default value
            expect(question.order).toBeGreaterThanOrEqual(0) // Order is auto-assigned
            await question.destroy()
        })

        it("should allow setting a custom totalPoints value", async () => {
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
                lectureId: lecture.id,
                totalPoints: 5.0
            })
            question = await question.reload()
            expect(question.totalPoints).toEqual(5.0)
            await question.destroy()
        })

        it("should reject a negative totalPoints value", async () => {
            await expect(db.Question.create({
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
                lectureId: lecture.id,
                totalPoints: -3
            })).rejects.toThrow("Validation error: totalPoints cannot be less than 0")
        })

        it("should auto-assign an order value", async () => {
            let question1 = await db.Question.create({
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
                lectureId: lecture.id
            })

            let question2 = await db.Question.create({
                type: 'multiple choice',
                stem: 'What is 2 + 2?',
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
                    1: false,
                    2: true,
                    3: false
                },
                lectureId: lecture.id
            })

            expect(question2.order).toEqual(question1.order + 1)
            await question1.destroy()
            await question2.destroy()
        })

        it("should reject a duplicate order within the same lecture", async () => {
            const question1 = await db.Question.create({
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
                lectureId: lecture.id
            })
            await expect(db.Question.create({
                type: 'multiple choice',
                stem: 'What is 2 + 2?',
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
                    1: false,
                    2: true,
                    3: false
                },
                lectureId: lecture.id,
                order: question1.order
            })).rejects.toThrow(ValidationError)

            await question1.destroy()
        })
    })

    afterAll(async () => {
        await lecture.destroy()
    })
})
