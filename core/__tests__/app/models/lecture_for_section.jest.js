'use strict'

const db = require('../../../app/models/index')
const { UniqueConstraintError } = require('sequelize')
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
        it ("should create a valid LectureForSection", async () => {
            const lfs = await db.LectureForSection.create({
                lectureId: lecture.id,
                sectionId: section.id
            })

            expect(lfs.lectureId).toEqual(lecture.id)
            expect(lfs.sectionId).toEqual(section.id)
            expect(lfs.published).toEqual(false) // default
            expect(lfs.closedAt).toBeFalsy() // null to start, changes when course goes published -> not published
            expect(lfs.averageScore).toBeFalsy() // nullable
            expect(lfs.participationScore).toBeFalsy() // nullable
            await lfs.destroy()
        })

        it ("should reject a lectureForSection with no lecture id", async () => {
            await expect(db.LectureForSection.create({
                sectionId: section.id
            })).rejects.toThrow("notNull Violation: Lecture For Section must have a lecture")
        })

        it ("should reject a lectureForSection with no section id", async () => {
            await expect(db.LectureForSection.create({
                lectureId: lecture.id
            })).rejects.toThrow("notNull Violation: Lecture For Section must have a section")
        })

        it ("should reject a duplicate entry in lfs", async () => {
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
                sectionId: section.id,
                published: true
            })
        })

        it("should change averageScore to 1.0", async () => {
            await lfs.update({ averageScore: 1.0 })
            await expect(lfs.save()).resolves.toBeTruthy()
            await lfs.reload()
            expect(lfs.averageScore).toEqual(1.0)
        })

        it("should change participationScore to 1.0", async () => {
            await lfs.update({ participationScore: 1.0 })
            await expect(lfs.save()).resolves.toBeTruthy()
            await lfs.reload()
            expect(lfs.participationScore).toEqual(1.0)
        })

        it("should change published to false and update the closedAt time", async () => {
            await lfs.update({ published: false })
            await expect(lfs.save()).resolves.toBeTruthy()
            await lfs.reload()
            const dateMinusOneSec = moment().subtract(1, 'seconds').utc().format("YYYY-MM-DD HH:mm:ss")
            const datePlusOneSec = moment().add(1, 'seconds').utc().format("YYYY-MM-DD HH:mm:ss")
            const isWithinTimeRange = moment(lfs.closedAt).isBetween(dateMinusOneSec, datePlusOneSec)
            expect(lfs.published).toEqual(false)
            expect(isWithinTimeRange).toEqual(true)
        })

        afterEach(async () => {
            await lfs.destroy()
        })
    })

    
    afterAll(async () => {
        await course.destroy()
    })
})