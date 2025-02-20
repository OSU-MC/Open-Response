"use strict";
const db = require("../../../app/models");
const { SequelizeUniqueConstraintError } = require("sequelize");
describe("RequiredQuestionsInLectures model", () => {
    let course, lecture, question, requiredQuestion;

    beforeAll(async () => {
        // Ensure the database schema is correctly initialized
        await db.sequelize.sync();

        // Ensure a valid course exists
        course = await db.Course.create({
            name: "CS101",
            description: "Introduction to Computer Science"
        });

        // Ensure a valid lecture exists (linked to the course)
        lecture = await db.Lecture.create({
            title: "Lecture 1",
            description: "Introduction to CS",
            courseId: course.id
        });

        // Ensure a valid question exists (linked to the same course)
        question = await db.Question.create({
            type: "multiple choice",
            stem: "What is 2 + 2?",
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
                1: false,
                2: true,
                3: false
            },
            lectureId: lecture.id, // Linking it to the lecture
            courseId: course.id    // Ensure courseId exists to satisfy constraints
        });
    });

    describe("RequiredQuestionsInLectures.create", () => {
        it("should create a valid required question in lecture", async () => {
            requiredQuestion = await db.RequiredQuestionsInLecture.create({
                lectureId: lecture.id,
                questionId: question.id
            });

            expect(requiredQuestion.lectureId).toEqual(lecture.id);
            expect(requiredQuestion.questionId).toEqual(question.id);

            // Cleanup the created record
            await requiredQuestion.destroy();
        });

        it("should reject a required question without a `lectureId`", async () => {
            await expect(db.RequiredQuestionsInLecture.create({
                questionId: question.id
            })).rejects.toThrow("notNull Violation: RequiredQuestionsInLecture.lectureId cannot be null");
        });

        it("should reject a required question without a `questionId`", async () => {
            await expect(db.RequiredQuestionsInLecture.create({
                lectureId: lecture.id
            })).rejects.toThrow("notNull Violation: RequiredQuestionsInLecture.questionId cannot be null");
        });

        it("should reject duplicate entries for the same lecture and question", async () => {
            // First insert should succeed
            await db.RequiredQuestionsInLecture.create({
                lectureId: lecture.id,
                questionId: question.id
            });

            // Second insert should fail due to uniqueness constraint
            await expect(db.RequiredQuestionsInLecture.create({
                lectureId: lecture.id,
                questionId: question.id
            })).rejects.toThrow(SequelizeUniqueConstraintError);
        });
    });

    afterAll(async () => {
        // Cleanup the created records
        await db.RequiredQuestionsInLecture.destroy({ where: {} });
        await db.Question.destroy({ where: {} });
        await db.Lecture.destroy({ where: {} });
        await db.Course.destroy({ where: {} });
    });
});
