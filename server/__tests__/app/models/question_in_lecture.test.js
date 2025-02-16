'use strict'

const db = require('../../../app/models/index')
const { UniqueConstraintError, ValidationError } = require('sequelize')

describe('QuestionInLecture model', () => {
    let lecture
    let course
    let section
    let lectureForSection
    let question1
    let question2

    beforeAll(async () => {
        try {
            
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
                number: 1,
                courseId: course.id
            })
            lectureForSection = await db.LectureForSection.create({
                lectureId: lecture.id,
                sectionId: section.id,
                attendanceMethod: 'join'
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
        } catch (error) {
            console.error(error)
        }
        })
        
        describe('QuestionInLecture.create', () => {
            it("should create a valid QuestionInLecture", async () => {
            const qil = await db.QuestionInLecture.create({
                lectureForSectionId: lectureForSection.id,
                questionId: question1.id
            })

            expect(qil.lectureForSectionId).toEqual(lectureForSection.id)
            expect(qil.questionId).toEqual(question1.id)
            expect(qil.publishedAt).toBeNull() // Default: not published
            expect(qil.softDelete).toBeFalsy() // Default: not deleted
            await qil.destroy()
        })

        it("should invalidate a missing lectureForSectionId", async () => {
            await expect(db.QuestionInLecture.create({
                questionId: question1.id
            })).rejects.toThrow("notNull Violation: QuestionInLecture must have a LectureForSection")
        })

        it("should invalidate a missing questionId", async () => {
            await expect(db.QuestionInLecture.create({
                lectureForSectionId: lectureForSection.id
            })).rejects.toThrow("notNull Violation: QuestionInLecture must have a question")
        })

        it("should invalidate a repeat question for the lectureForSection", async () => {
            const qil = await db.QuestionInLecture.create({
                lectureForSectionId: lectureForSection.id,
                questionId: question1.id
            })
            await expect(db.QuestionInLecture.create({
                lectureForSectionId: lectureForSection.id,
                questionId: question1.id,
            })).rejects.toThrow(UniqueConstraintError)
            await qil.destroy()
        })
    })

    describe("QuestionInLecture.update", () => {
        let qil;
    
        beforeEach(async () => {
            qil = await db.QuestionInLecture.create({
                lectureForSectionId: lectureForSection.id,
                questionId: question1.id
            });
        });
    
        it("should update publishedAt to a timestamp", async () => {
            const publishedAt = new Date();

            const publishedAtUTC = new Date(publishedAt.getTime() + (publishedAt.getTimezoneOffset() * 60000));

            let updated_id = qil.id;
            await db.sequelize.query(
                `UPDATE QuestionInLectures SET publishedAt = :publishedAt WHERE id = :id`,
                {
                    replacements: { publishedAt: publishedAtUTC, id: updated_id },
                    type: db.Sequelize.QueryTypes.UPDATE
                }
            );
            const reloadedQil = await db.sequelize.query(
                `SELECT publishedAt FROM QuestionInLectures WHERE id = :id`,
                {
                    replacements: { id: updated_id },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );
        
            const retrievedDate = new Date(reloadedQil[0].publishedAt);
        
            const expectedTime = new Date(publishedAt.setMilliseconds(0)).toISOString();
            const actualTime = new Date(retrievedDate.setMilliseconds(0)).toISOString();
        
            expect(actualTime).toEqual(expectedTime);
        });
    
        it("should soft delete a QuestionInLecture", async () => {
            let updated_id = qil.id;
    
            // Using raw SQL query to update
            await db.sequelize.query(
                `UPDATE QuestionInLectures SET softDelete = :softDelete WHERE id = :id`,
                {
                    replacements: { softDelete: true, id: updated_id },
                    type: db.Sequelize.QueryTypes.UPDATE
                }
            );
    
            // Fetch the updated row using raw SQL
            const reloadedQil = await db.sequelize.query(
                `SELECT * FROM QuestionInLectures WHERE id = :id`,
                {
                    replacements: { id: updated_id },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );
    
            expect(reloadedQil[0]).not.toBeNull(); // Ensure it exists
            expect(reloadedQil[0].softDelete).toBeTruthy();
        });
    
        afterEach(async () => {
            if (qil) await qil.destroy();
        });
    });
    

    afterAll(async () => {
        await lectureForSection.destroy()
        await question1.destroy()
        await question2.destroy()
        await lecture.destroy()
        await course.destroy()
    })
})
