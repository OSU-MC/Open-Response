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
                sectionId: section.id,
                attendanceMethod: "join"
            })

            expect(lfs.lectureId).toEqual(lecture.id)
            expect(lfs.sectionId).toEqual(section.id)
            expect(lfs.publishedAt).toBeNull() // Default: not published
            expect(lfs.closeAttendanceAt).toBeNull() // Null unless changed
            expect(lfs.minAttendanceQuestions).toBe(0) // Default: 0
            await lfs.destroy()
        })

        it("should reject a LectureForSection without a lectureId", async () => {
            await expect(db.LectureForSection.create({
                sectionId: section.id,
                attendanceMethod: "join"
            })).rejects.toThrow("notNull Violation: Lecture For Section must have a lecture")
        })

        it("should reject a LectureForSection without a sectionId", async () => {
            await expect(db.LectureForSection.create({
                lectureId: lecture.id,
                attendanceMethod: "join"
            })).rejects.toThrow("notNull Violation: Lecture For Section must have a section")
        })

        it("should reject a LectureForSection without an attendanceMethod", async () => {
            await expect(db.LectureForSection.create({
                lectureId: lecture.id,
                sectionId: section.id
            })).rejects.toThrow("notNull Violation: LectureForSection.attendanceMethod cannot be null")
        })

        it("should reject an invalid attendanceMethod value", async () => {
            await expect(db.LectureForSection.create({
                lectureId: lecture.id,
                sectionId: section.id,
                attendanceMethod: "invalidMethod"
            })).rejects.toThrow("Lecture For Section must have a valid attendance method")
        });

        it("should reject a duplicate LectureForSection entry", async () => {
            const lfs = await db.LectureForSection.create({
                lectureId: lecture.id,
                sectionId: section.id,
                attendanceMethod: "join"
            })
            await expect(db.LectureForSection.create({
                lectureId: lecture.id,
                sectionId: section.id,
                attendanceMethod: "join"
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
                attendanceMethod: "join"
            })
        })

        it("should update publishedAt timestamp", async () => {
            const publishedAt = moment().utc();

            await lfs.update({ publishedAt });
            await expect(lfs.save()).resolves.toBeTruthy();

            const updatedLfs = await db.LectureForSection.findOne({ where: { id: lfs.id } });

            expect(updatedLfs.publishedAt).not.toBeNull();
            expect(moment(updatedLfs.publishedAt).utc().isSame(publishedAt, 'second')).toBe(true);
        });

        it("should update closeAttendanceAt timestamp", async () => {
            const closeAttendanceAt = moment().utc();

            await lfs.update({ closeAttendanceAt });
            await expect(lfs.save()).resolves.toBeTruthy();

            const updatedLfs = await db.LectureForSection.findOne({ where: { id: lfs.id } });

            expect(updatedLfs.closeAttendanceAt).not.toBeNull();
            expect(moment(updatedLfs.closeAttendanceAt).utc().isSame(closeAttendanceAt, 'second')).toBe(true);
        });

        it("should update closedAt timestamp", async () => {
            const closedAt = moment().utc().format("YYYY-MM-DD HH:mm:ss");
        
            await lfs.update({ published: true });
            await lfs.reload();
        
            await lfs.update({ published: false });
            await expect(lfs.save()).resolves.toBeTruthy();
        
            const updatedLfs = await db.LectureForSection.findOne({ where: { id: lfs.id } });
        
            expect(updatedLfs.closedAt).not.toBeNull();
            expect(moment(updatedLfs.closedAt).utc().isSame(closedAt, 'second')).toBe(true);
        });
        
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
            if (lfs) await lfs.destroy()
        })
    })

    afterAll(async () => {
        await section.destroy()
        await lecture.destroy()
        await course.destroy()
    })
})
