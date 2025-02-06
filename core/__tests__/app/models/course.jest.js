const db = require('../../../app/models')

describe("Course model", () => {

    let course //declare course so it can be accessed in all the following tests, where necessary

    describe("Course.create", () => {
        it ("should create a valid course record with default values", async () => {
            const course = await db.Course.create({
                name: 'PH201: Introduction to Physics',
                description: 'An introduction to physics concepts, such as kinematics, Newton\'s Laws, and more.'
            })
            expect(course.name).toEqual("PH201: Introduction to Physics")
            expect(course.description).toEqual("An introduction to physics concepts, such as kinematics, Newton\'s Laws, and more.")
            expect(course.published).toBeFalsy()
            await course.destroy()
        })

        it ("should create a valid course record with a published course", async () => {
            const course = await db.Course.create({
                name: 'PH201: Introduction to Physics',
                description: 'An introduction to physics concepts, such as kinematics, Newton\'s Laws, and more.',
                published: true
            })
            expect(course.name).toEqual("PH201: Introduction to Physics")
            expect(course.description).toEqual("An introduction to physics concepts, such as kinematics, Newton\'s Laws, and more.")
            expect(course.published).toBeTruthy()
            await course.destroy()
        })
    
        it ("should reject a null course name", async () => {
            await expect(db.Course.create({
                description: 'An introduction to physics concepts, such as kinematics, Newton\'s Laws, and more.'
            })).rejects.toThrow("notNull Violation: Course name required")
        })
    
        it ("should reject an empty course name", async () => {
            await expect(db.Course.create({
                name: '',
                description: 'An introduction to physics concepts, such as kinematics, Newton\'s Laws, and more.'
            })).rejects.toThrow("Validation error: Course name cannot be empty")
        })

        it ("should reject an empty course description", async () => {
            await expect(db.Course.create({
                name: 'PH201: Introduction to Physics',
                description: ''
            })).rejects.toThrow("Validation error: Course description, if it exists, cannot be empty")
        })

        it ("should accept a null course description", async () => {
            const course = await db.Course.create({
                name: 'PH201: Introduction to Physics'
            })
            expect(course.name).toEqual("PH201: Introduction to Physics")
            expect(course.description).toBeUndefined()
            expect(course.published).toBeFalsy()
        })

        it ("should reject a description over 500 characters", async () => {
            await expect(db.Course.create({
                name: 'PH201: Introduction to Physics',
                description: 'An introduction to physics concepts, such as kinematics, Newton\'s Laws, and more. This course will involve a lot of hard work and dedication to complete.An introduction to physics concepts, such as kinematics, Newton\'s Laws, and more. This course will involve a lot of hard work and dedication to complete.An introduction to physics concepts, such as kinematics, Newton\'s Laws, and more. This course will involve a lot of hard work and dedication to complete.An introduction to physics concepts, such as kinematics, Newton\'s Laws, and more. This course will involve a lot of hard work and dedication to complete.'
            })).rejects.toThrow("Validation error: Course description must be less than or equal to 500 characters")
        })
    
        it ("should reject a name over 50 characters", async () => {
            await expect(db.Course.create({
                name: 'PH201: Introduction to Physics with labs and lectures that happen for 4 days of the week',
                description: 'An introduction to physics concepts, such as kinematics, Newton\'s Laws, and more.'
            })).rejects.toThrow("Validation error: Course name must be less than or equal to 50 characters")
        })
    })

    describe("Course.update", () => {

        beforeEach(async() => {
            course = await db.Course.create({
                name: 'PH201: Introduction to Physics',
                description: 'An introduction to physics concepts, such as kinematics, Newton\'s Laws, and more.'
            })
        })

        it ("should update the course name", async () => {
            await course.update({name: "PH202: Introduction to Physics II"})
            await expect(course.save()).resolves.toBeTruthy()
            await course.reload() // reloads the instance from the database after the update into the course variables
            expect(course.name).toEqual("PH202: Introduction to Physics II")
        })

        it ("should update the description", async () => {
            await course.update({description: "This is the second course in the physics 20x series."})
            await expect(course.save()).resolves.toBeTruthy()
            await course.reload() 
            expect(course.description).toEqual("This is the second course in the physics 20x series.")
        })

        it ("should update the published status of the course", async () => {
            await course.update({published: true})
            await expect(course.save()).resolves.toBeTruthy()
            await course.reload()
            expect(course.published).toEqual(true)
        })

        afterEach(async () => {
            await course.destroy()
        })
    })
})