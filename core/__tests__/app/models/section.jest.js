const db = require('../../../app/models')

describe("Section model", () => {

    let course

    beforeAll(async () => {
        course = await db.Course.create({
            name: 'PH211: Introduction to Physics',
            description: 'An introduction to physics concepts, such as kinematics, Newton\'s Laws, and more.'
        })
    })

    describe("Section.create", () => {
        it ("should create a valid section record with default values", async () => {
            const section = await db.Section.create({
                number: 1,
                courseId: course.id
            })
            expect(section.number).toEqual(1)
            expect(section.joinCode).toBeTruthy()
            expect(section.courseId).toEqual(course.id)
            await section.destroy()
        })

        it ("should reject a section with repeated section number in the same course", async () => {
            const section = await db.Section.create({
                number: 15,
                courseId: course.id
            })
            await expect(db.Section.create({
                number: 15,
                courseId: course.id
            })).rejects.toThrow("Validation error")
            await section.destroy()
        })
    
        it ("should reject a null section number", async () => {
            await expect(db.Section.create({
                courseId: course.id
            })).rejects.toThrow("notNull Violation: Section.number cannot be null")
        })

        it ("should reject a section without a courseId", async () => {
            await expect(db.Section.create({
                number: 9
            })).rejects.toThrow("notNull Violation: A section must belong to a course")
        })
    
    })

    describe("Section.update", () => {

        let section

        beforeEach(async() => {
            section = await db.Section.create({
                number: 20,
                courseId: course.id
            })
        })

        it ("should update the section number", async () => {
            await section.update({number: 25})
            await expect(section.save()).resolves.toBeTruthy()
            await section.reload() // reloads the instance from the database after the update into the section variables
            expect(section.number).toEqual(25)
        })

        it ("should update the section join code", async () => {
            await section.update({joinCode: "5TY7UI"})
            await expect(section.save()).resolves.toBeTruthy()
            await section.reload() // reloads the instance from the database after the update into the section variables
            expect(section.joinCode).toEqual("5TY7UI")
        })

        afterEach(async () => {
            await section.destroy()
        })
    })

    afterAll(async () => {
        await course.destroy()
    })
})