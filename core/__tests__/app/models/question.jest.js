"use strict";
const db = require("../../../app/models");
const { ForeignKeyConstraintError, ValidationError } = require("sequelize");

describe("Question model", () => {
    let course, lecture;

    beforeAll(async () => {
        // Create a valid course first
        course = await db.Course.create({
            name: "Test Course 1",
            description: "A course for testing!"
        });
    
        // Ensure a valid lecture exists with the required `courseId`
        lecture = await db.Lecture.create({
            title: "Lecture 1",
            description: "An introduction to testing",
            courseId: course.id // Ensure courseId is present
        });
    });
    
    describe("Question.create", () => {
        let question;

        it("should invalidate the type because it does not exist", async () => {
            await expect(db.Question.create({
                type: "graphing",
                stem: "Graph y = x + 1",
                content: {},
                answers: {},
                lectureId: lecture.id
            })).rejects.toThrow("Validation error: Question type is not a valid option");
        });

        it("should invalidate because a stem was not provided", async () => {
            await expect(db.Question.create({
                type: "multiple answer",
                content: {},
                answers: {},
                lectureId: lecture.id
            })).rejects.toThrow("notNull Violation: Question stem text must be provided");
        });

        it("should invalidate because the stem provided was empty", async () => {
            await expect(db.Question.create({
                type: "multiple answer",
                stem: "  ",
                content: {},
                answers: {},
                lectureId: lecture.id
            })).rejects.toThrow("Validation error: Question stem text must be provided");
        });

        it("should invalidate because no lectureId was provided", async () => {
            await expect(db.Question.create({
                type: "multiple choice",
                stem: "What is 1 + 2?",
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
                }
            })).rejects.toThrow("notNull Violation: Question must have a lecture");
        });

        it("should invalidate because no lecture with lectureId exists", async () => {
            await expect(db.Question.create({
                type: "multiple choice",
                stem: "What is 1 + 2?",
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
                lectureId: 999999 // Non-existent lectureId
            })).rejects.toThrow(ForeignKeyConstraintError);
        });

        it("should create a valid multiple choice question with default values", async () => {
            question = await db.Question.create({
                type: "multiple choice",
                stem: "What is 1 + 2?",
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
            });

            expect(question.type).toEqual("multiple choice");
            expect(question.stem).toEqual("What is 1 + 2?");
            expect(question.content.options).not.toBeNull();
            expect(question.totalPoints).toEqual(1.0); // Default value
            await question.destroy();
        });

        it("should allow setting a custom totalPoints value", async () => {
            question = await db.Question.create({
                type: "multiple choice",
                stem: "What is 1 + 2?",
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
                lectureId: lecture.id,
                totalPoints: 5.0
            });

            expect(question.totalPoints).toEqual(5.0);
            await question.destroy();
        });

        it("should reject a negative totalPoints value", async () => {
            await expect(db.Question.create({
                type: "multiple choice",
                stem: "What is 1 + 2?",
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
                lectureId: lecture.id,
                totalPoints: -3
            })).rejects.toThrow("Validation error: totalPoints cannot be less than 0");
        });
    });

    afterAll(async () => {
        if (lecture) await lecture.destroy();
        if (course) await course.destroy();
    });
});