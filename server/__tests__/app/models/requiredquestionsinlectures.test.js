const db = require('../../../app/models')

describe("RequiredQuestionsInLectures model", () => {
    let lecture, question, requiredQuestion;

    beforeAll(async () => {
        const course = await db.Course.create({
            name: "CS101",
            description: "Introduction to Computer Science"
        });

        lecture = await db.Lecture.create({
            title: "Lecture 1",
            description: "Introduction to CS",
            courseId: course.id
        });

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
            lectureId: lecture.id
        });
    });

    describe("RequiredQuestionsInLectures.create", () => {
        it("should create a valid required question in lecture", async () => {
            requiredQuestion = await db.RequiredQuestionsInLectures.create({
                lectureId: lecture.id,
                questionId: question.id
            });

            expect(requiredQuestion.lectureId).toEqual(lecture.id);
            expect(requiredQuestion.questionId).toEqual(question.id);
        });

        it("should reject a required question without a `lectureId`", async () => {
            await expect(db.RequiredQuestionsInLectures.create({
                questionId: question.id
            })).rejects.toThrow("notNull Violation: RequiredQuestionInLecture must be associated with a lecture");
        });

        it("should reject a required question without a `questionId`", async () => {
            await expect(db.RequiredQuestionsInLectures.create({
                lectureId: lecture.id
            })).rejects.toThrow("notNull Violation: RequiredQuestionInLecture must be associated with a question");
        });

        it("should reject duplicate entries for the same lecture and question", async () => {
            await expect(db.RequiredQuestionsInLectures.create({
                lectureId: lecture.id,
                questionId: question.id
            })).rejects.toThrow("Validation error");
        });
    });

    afterAll(async () => {
        await requiredQuestion.destroy();
    });
});
