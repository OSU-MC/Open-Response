'use strict'

const db = require('../../../app/models/index')
const { UniqueConstraintError } = require('sequelize')

describe('QuestionInLecture model', () => {
    let lecture
    let course
    let question1
    let question2

    beforeAll(async () => {
        course = await db.Course.create({
            name: 'Testing Things',
            description: 'An introduction to testing many things'
        })
        lecture = await db.Lecture.create({
            title: 'Introduce Testing Thingy Things',
            description: 'The things be testing thingy',
            courseId: course.id
        })
        question1 = await db.Question.create({
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
        question2 = await db.Question.create({
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
                0: true,
                1: true,
                2: true,
                3: false
            },
            courseId: course.id
        })
    })

    describe('QuestionInLecture.create', () => {
        it ("should create a valid QuestionInLecture", async () => {
            const qil = await db.QuestionInLecture.create({
                lectureId: lecture.id,
                questionId: question1.id
            })

            expect(qil.lectureId).toEqual(lecture.id)
            expect(qil.questionId).toEqual(question1.id)
            expect(qil.order).toEqual(0) // inferred by the beforeCreate hook
            expect(qil.published).toEqual(false) //default value
            await qil.destroy()
        })

        it ("should infer an incremented order for subsequent QuestionInLectures", async () => {
            const qil1 = await db.QuestionInLecture.create({
                lectureId: lecture.id,
                questionId: question1.id
            })

            const qil2 = await db.QuestionInLecture.create({
                lectureId: lecture.id,
                questionId: question2.id
            })

            expect(qil2.order).toEqual(qil1.order + 1)

            await qil1.destroy()
            await qil2.destroy()
        })

        it ("should invalidate a missing lectureId", async () => {
            await expect(db.QuestionInLecture.create({
                questionId: question1.id
            })).rejects.toThrow("notNull Violation: QuestionInLecture must have a lecture")
        })

        it ("should invalidate a missing questionId", async () => {
            await expect(db.QuestionInLecture.create({
                lectureId: lecture.id
            })).rejects.toThrow("notNull Violation: QuestionInLecture must have a question")
        })

        it ("should invalidate a repeat order for the lecture", async () => {
            const qil = await db.QuestionInLecture.create({
                lectureId: lecture.id,
                questionId: question1.id
            })
            await expect(db.QuestionInLecture.create({
                lectureId: lecture.id,
                questionId: question2.id,
                order: qil.order
            })).rejects.toThrow(UniqueConstraintError)
            await qil.destroy()
        })
    })

    describe("QuestionInLecture.update", () => {

        let qil

        beforeEach(async () => {
            qil = await db.QuestionInLecture.create({
                lectureId: lecture.id,
                questionId: question1.id
            })
        })

        it("should properly update the publication status of the Question in the Lecture", async () => {
            qil.published = true
            await expect(qil.save()).resolves.toBeTruthy()
            await qil.reload()
            expect(qil.published).toEqual(true)
        })

        it ("should invalidate an order that already exists in the Lecture", async () => {
            const qil0 = await db.QuestionInLecture.create({
                lectureId: lecture.id,
                questionId: question2.id
            })
            qil0.order = 0
            await expect(qil0.save()).rejects.toThrow(UniqueConstraintError)
            await qil0.destroy()
        })

        afterEach(async () => {
            await qil.destroy()
        })
    })

    
    afterAll(async () => {
        await course.destroy()
    })
})