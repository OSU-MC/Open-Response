
const { UniqueConstraintError } = require('sequelize')
const db = require('../../../app/models')

describe('Lecture model', () => {
    let lecture
    let course

    beforeAll(async () => {
        course = await db.Course.create({
            name: 'PH202: Introduction to Physics',
            description: 'An introduction to physics concepts, such as kinematics, Newton\'s Laws, and more.'
        })
    })

    describe('Lecture.create', () => {
        it('should create lecture with provided/default values', async () => {
            const lecture = await db.Lecture.create({
                title: 'question set 1',
                order: 1,
                description: 'intro q',
                courseId: course.id
            })
            expect(typeof (lecture.id)).toBe('number')
            expect(lecture.title).toEqual('question set 1')
            expect(lecture.order).toEqual(1)
            expect(lecture.description).toEqual('intro q')
            expect(lecture.courseId).toEqual(course.id)
            await lecture.destroy()
        })

        it('should reject a lecture with missing title', async () => {
            await expect(db.Lecture.create({
                order: 2,
                description: 'intro q',
                courseId: course.id
            })).rejects.toThrow('Lecture name required')
        })

        it('should reject a lecture with missing course', async () => {
            await expect(db.Lecture.create({
                order: 3,
                description: 'intro q',
                title: 'question set 1'
            })).rejects.toThrow('notNull Violation: Lecture must have a course')
        })

        it('should reject a lecture with empty title', async () => {
            await expect(db.Lecture.create({
                title: '',
                order: 2,
                description: 'intro q',
                courseId: course.id
            })).rejects.toThrow('Validation error: Title must be between 1 and 50 characters')
        })

        it('should reject a lecture title > 50 characters', async () => {
            await expect(db.Lecture.create({
                title: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',   // 51 chars
                order: 2,
                description: 'intro q',
                courseId: course.id
            })).rejects.toThrow('Validation error: Title must be between 1 and 50 characters')
        })

        it('should reject a new entry with matching order AND courseId', async () => {
            let new_lecture = await db.Lecture.create({
                title: 'new lec',
                order: 1,
                description: 'new intro q',
                courseId: course.id
            })
            await expect(db.Lecture.create({
                title: 'new lec',
                order: 1,
                description: 'new intro q',
                courseId: course.id
            })).rejects.toThrow(UniqueConstraintError)
            await new_lecture.destroy()
        })

        it ('should auto-increment order within a course when not provided', async() => {
            let lecture_1 = await db.Lecture.create({
                title: 'Lecture 1',
                order: 0,
                description: 'Introduction to Course',
                courseId: course.id
            })
            let lecture_2 = await db.Lecture.create({
                title: 'Lecture 2',
                description: 'Simple 2-D Motion',
                courseId: course.id
            })
            expect(lecture_2.order).toEqual(1)
            await lecture_1.destroy()
            await lecture_2.destroy()
        })
    })

    describe('Lecture.update', () => {
        beforeEach(async() => {
            lecture = await db.Lecture.create({
                title: 'question set 1',
                order: 5,
                description: 'intro q',
                courseId: course.id
            })
        })

        it('should update lecture title', async () => {
            await lecture.update({title: 'set 2'})
            await expect(lecture.save()).resolves.toBeTruthy()
            await lecture.reload()
            expect(lecture.title).toEqual('set 2')
        })

        it('should update lecture order', async () => {
            await lecture.update({order: 6})
            await expect(lecture.save()).resolves.toBeTruthy()
            await lecture.reload()
            expect(lecture.order).toEqual(6)
        })

        it('should update lecture description', async () => {
            await lecture.update({description: 'new description'})
            await expect(lecture.save()).resolves.toBeTruthy()
            await lecture.reload()
            expect(lecture.description).toEqual('new description')
        })

        afterEach(async () => {
            await lecture.destroy()
        })
    })
})