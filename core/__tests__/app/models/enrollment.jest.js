const db = require('../../../app/models')

describe("Enrollment model", () => {

    let course
    let section
    let user

    beforeAll(async () => {
        user = await db.User.create({
            firstName: 'Dan',
            lastName: 'Smith',
            email: 'danSmith2@myclassroom.com',
            isTeacher: true,
            rawPassword: 'Danny-o123!'
        })
        course = await db.Course.create({
            name: 'PH202: Introduction to Physics',
            description: 'An introduction to physics concepts, such as kinematics, Newton\'s Laws, and more.'
        })
        section = await db.Section.create({
            number: 16,
            joinCode: "1yhs19", // some alphanumeric value
            courseId: course.id
        })
    })

    describe("Enrollment.create", () => {
        it ("should create a valid enrollment record with student role", async () => {
            const enrollment = await db.Enrollment.create({
                role: "student",
                sectionId: section.id,
                userId: user.id
            })
            expect(enrollment.role).toEqual("student")
            expect(enrollment.sectionId).toEqual(section.id)
            expect(enrollment.userId).toEqual(user.id)
            await enrollment.destroy()
        })

        it ("should create a valid enrollment record with teacher role", async () => {
            const enrollment = await db.Enrollment.create({
                role: "teacher",
                courseId: course.id,
                userId: user.id
            })
            expect(enrollment.role).toEqual("teacher")
            expect(enrollment.courseId).toEqual(course.id)
            expect(enrollment.userId).toEqual(user.id)
            await enrollment.destroy()
        })

        it ("should create a valid enrollment record with ta role", async () => {
            const enrollment = await db.Enrollment.create({
                role: "ta",
                sectionId: section.id,
                userId: user.id
            })
            expect(enrollment.role).toEqual("ta")
            expect(enrollment.sectionId).toEqual(section.id)
            expect(enrollment.userId).toEqual(user.id)
            await enrollment.destroy()
        })

        it ("should reject an enrollment with a role that isn't student, teacher, ta, or admin", async () => {
            await expect(db.Enrollment.create({
                role: "ergesetb",
                courseId: course.id,
                userId: user.id
            })).rejects.toThrow("Validation error: Validation isIn on role failed")
        })

        it ("should reject an enrollment with no role", async () => {
            await expect(db.Enrollment.create({
                courseId: course.id,
                userId: user.id
            })).rejects.toThrow("notNull Violation: Enrollment role required")
        })

        it ("should reject a teacher with a section and no course", async () => {
            await expect(db.Enrollment.create({
                role: "teacher",
                sectionId: section.id,
                userId: user.id
            })).rejects.toThrow("Validation error: A teacher cannot be enrolled at the section level")
        })

        it ("should reject a teacher with no course and no section", async() => {
            await expect(db.Enrollment.create({
                role: "teacher",
                userId: user.id
            })).rejects.toThrow("Validation error: Teacher must be enrolled in a course")
        })

        it ("should reject a non-teacher with a course and no section", async() => {
            await expect(db.Enrollment.create({
                role: "student",
                courseId: course.id,
                userId: user.id
            })).rejects.toThrow("Validation error: Only a teacher can be enrolled at the course level")
        })

        it ("should reject a non-teacher with no course and no section", async() => {
            await expect(db.Enrollment.create({
                role: "student",
                userId: user.id
            })).rejects.toThrow("Validation error: student must be enrolled in a section")
        })

        it ("should reject any role with a course and a section", async() => {
            await expect(db.Enrollment.create({
                role: "teacher",
                sectionId: section.id,
                courseId: course.id,
                userId: user.id
            })).rejects.toThrow("Validation error: Enrollment cannot be in a section and a course")
            await expect(db.Enrollment.create({
                role: "student",
                sectionId: section.id,
                courseId: course.id,
                userId: user.id
            })).rejects.toThrow("Validation error: Enrollment cannot be in a section and a course")
        })

        it ("should reject a duplicate enrollment", async() => {
            const enrollment = await db.Enrollment.create({
                role: "student",
                sectionId: section.id,
                userId: user.id
            })
            await expect(db.Enrollment.create({
                role: "student",
                sectionId: section.id,
                userId: user.id
            })).rejects.toThrow("Validation error")
            await enrollment.destroy()
        })
    
    })

    describe("Enrollment.update", () => {

        let enrollment //declare enrollment so it can be accessed in all the following tests, where necessary

        beforeEach(async() => {
            enrollment = await db.Enrollment.create({
                role: "student",
                sectionId: section.id,
                userId: user.id
            })
        })

        it ("should update the enrollment role", async () => {
            await enrollment.update({role: "ta"})
            await expect(enrollment.save()).resolves.toBeTruthy()
            await enrollment.reload() // reloads the instance from the database after the update into the section variables
            expect(enrollment.role).toEqual("ta")
        })

        afterEach(async () => {
            await enrollment.destroy()
        })
    })

    afterAll(async () => {
        await user.destroy()
        await course.destroy()
        await section.destroy()
    })
})