'use strict'

const db = require('../../../app/models/index')
const { UniqueConstraintError, ValidationError } = require('sequelize')

describe('QuestionInLecture model', () => {
    let lecture
    let course
    let question1
    let question2
    let lectureForSection

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
        lectureForSection = await db.LectureForSection.create({
            lectureId: lecture.id,
            sectionId: 1 // Assuming a section already exists
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
            lectureId: lecture.id
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
            lectureId: lecture.id
        })
    })

    describe('QuestionInLecture.create', () => {
        it("should create a valid QuestionInLecture", async () => {
            const qil = await db.QuestionInLecture.create({
                lectureForSectionId: lectureForSection.id,
                questionId: question1.id
            })

            expect(qil.lectureForSectionId).toEqual(lectureForSection.id)
            expect(qil.questionId).toEqual(question1.id)
            expect(qil.order).toEqual(0) // inferred by the beforeCreate hook
            expect(qil.publishedAt).toBeNull() // Default: not published
            expect(qil.softDelete).toBeFalsy() // Default: not deleted
            await qil.destroy()
        })

        it("should infer an incremented order for subsequent QuestionInLectures", async () => {
            const qil1 = await db.QuestionInLecture.create({
                lectureForSectionId: lectureForSection.id,
                questionId: question1.id
            })

            const qil2 = await db.QuestionInLecture.create({
                lectureForSectionId: lectureForSection.id,
                questionId: question2.id
            })

            expect(qil2.order).toEqual(qil1.order + 1)

            await qil1.destroy()
            await qil2.destroy()
        })

        it("should invalidate a missing lectureForSectionId", async () => {
            await expect(db.QuestionInLecture.create({
                questionId: question1.id
            })).rejects.toThrow("notNull Violation: QuestionInLecture must have a lectureForSection")
        })

        it("should invalidate a missing questionId", async () => {
            await expect(db.QuestionInLecture.create({
                lectureForSectionId: lectureForSection.id
            })).rejects.toThrow("notNull Violation: QuestionInLecture must have a question")
        })

        it("should invalidate a repeat order for the lectureForSection", async () => {
            const qil = await db.QuestionInLecture.create({
                lectureForSectionId: lectureForSection.id,
                questionId: question1.id
            })
            await expect(db.QuestionInLecture.create({
                lectureForSectionId: lectureForSection.id,
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
                lectureForSectionId: lectureForSection.id,
                questionId: question1.id
            })
        })

        it("should update publishedAt to a timestamp", async () => {
            const publishedAt = new Date()
            await qil.update({ publishedAt })
            await expect(qil.save()).resolves.toBeTruthy()
            await qil.reload()
            expect(qil.publishedAt).toEqual(publishedAt)
        })

        it("should soft delete a QuestionInLecture", async () => {
            await qil.update({ softDelete: true })
            await expect(qil.save()).resolves.toBeTruthy()
            await qil.reload()
            expect(qil.softDelete).toBeTruthy()
        })

        it("should invalidate an order that already exists in the lectureForSection", async () => {
            const qil0 = await db.QuestionInLecture.create({
                lectureForSectionId: lectureForSection.id,
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
        await lectureForSection.destroy()
        await question1.destroy()
        await question2.destroy()
        await lecture.destroy()
        await course.destroy()
    })
})
