'use strict'

const db = require('../../../app/models/index')
const { UniqueConstraintError, ValidationError } = require('sequelize')
const moment = require('moment')

describe('LectureForSection model', () => {
    let lecture
    let course
    let section

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
        section = await db.Section.create({
            number: 47,
            joinCode: "50GHJ9",
            courseId: course.id
        })
    })

    describe('LectureForSection.create', () => {
        it("should create a valid LectureForSection with default values", async () => {
            const lfs = await db.LectureForSection.create({
                lectureId: lecture.id,
                sectionId: section.id
            })

            expect(lfs.lectureId).toEqual(lecture.id)
            expect(lfs.sectionId).toEqual(section.id)
            expect(lfs.publishedAt).toBeNull() // Default: not published
            expect(lfs.closedAt).toBeNull() // Null unless changed
            expect(lfs.closeAttendanceAt).toBeNull() // Default: not set
            expect(lfs.attendanceMethod).toEqual("join") // Default value
            expect(lfs.minAttendanceQuestions).toBeNull() // Default: not set
            expect(lfs.averageScore).toBeNull() // Nullable
            expect(lfs.participationScore).toBeNull() // Nullable
            await lfs.destroy()
        })

        it("should reject a LectureForSection without a lectureId", async () => {
            await expect(db.LectureForSection.create({
                sectionId: section.id
            })).rejects.toThrow("notNull Violation: Lecture For Section must have a lecture")
        })

        it("should reject a LectureForSection without a sectionId", async () => {
            await expect(db.LectureForSection.create({
                lectureId: lecture.id
            })).rejects.toThrow("notNull Violation: Lecture For Section must have a section")
        })

        it("should reject a duplicate LectureForSection entry", async () => {
            const lfs = await db.LectureForSection.create({
                lectureId: lecture.id,
                sectionId: section.id
            })
            await expect(db.LectureForSection.create({
                lectureId: lecture.id,
                sectionId: section.id
            })).rejects.toThrow(UniqueConstraintError)
            await lfs.destroy()
        })
    })

    describe("LectureForSection.update", () => {

        let lfs

        beforeEach(async () => {
            lfs = await db.LectureForSection.create({
                lectureId: lecture.id,
                sectionId: section.id
            })
        })

        it("should update averageScore", async () => {
            await lfs.update({ averageScore: 1.0 })
            await expect(lfs.save()).resolves.toBeTruthy()
            await lfs.reload()
            expect(lfs.averageScore).toEqual(1.0)
        })

        it("should update participationScore", async () => {
            await lfs.update({ participationScore: 1.0 })
            await expect(lfs.save()).resolves.toBeTruthy()
            await lfs.reload()
            expect(lfs.participationScore).toEqual(1.0)
        })

        it("should update publishedAt and set closedAt to null", async () => {
            const publishedAt = new Date()
            await lfs.update({ publishedAt })
            await expect(lfs.save()).resolves.toBeTruthy()
            await lfs.reload()
            expect(lfs.publishedAt).toEqual(publishedAt)
            expect(lfs.closedAt).toBeNull()
        })

        it("should update publishedAt to null and set closedAt timestamp", async () => {
            const publishedAt = new Date()
            await lfs.update({ publishedAt })
            await expect(lfs.save()).resolves.toBeTruthy()

            await lfs.update({ publishedAt: null })
            await expect(lfs.save()).resolves.toBeTruthy()
            await lfs.reload()

            const dateMinusOneSec = moment().subtract(1, 'seconds').utc().format("YYYY-MM-DD HH:mm:ss")
            const datePlusOneSec = moment().add(1, 'seconds').utc().format("YYYY-MM-DD HH:mm:ss")
            const isWithinTimeRange = moment(lfs.closedAt).isBetween(dateMinusOneSec, datePlusOneSec)

            expect(lfs.publishedAt).toBeNull()
            expect(isWithinTimeRange).toBeTruthy()
        })

        it("should update closeAttendanceAt", async () => {
            const closeAttendanceAt = "15:30:00"
            await lfs.update({ closeAttendanceAt })
            await expect(lfs.save()).resolves.toBeTruthy()
            await lfs.reload()
            expect(lfs.closeAttendanceAt).toEqual(closeAttendanceAt)
        })

        it("should update attendanceMethod", async () => {
            await lfs.update({ attendanceMethod: "requiredQuestions" })
            await expect(lfs.save()).resolves.toBeTruthy()
            await lfs.reload()
            expect(lfs.attendanceMethod).toEqual("requiredQuestions")
        })

        it("should reject invalid attendanceMethod values", async () => {
            await expect(lfs.update({ attendanceMethod: "invalidMethod" })).rejects.toThrow(ValidationError)
        })

        it("should update minAttendanceQuestions", async () => {
            await lfs.update({ minAttendanceQuestions: 3 })
            await expect(lfs.save()).resolves.toBeTruthy()
            await lfs.reload()
            expect(lfs.minAttendanceQuestions).toEqual(3)
        })

        it("should reject negative minAttendanceQuestions", async () => {
            await expect(lfs.update({ minAttendanceQuestions: -1 })).rejects.toThrow(ValidationError)
        })

        afterEach(async () => {
            await lfs.destroy()
        })
    })

    afterAll(async () => {
        await section.destroy()
        await lecture.destroy()
        await course.destroy()
    })
})
