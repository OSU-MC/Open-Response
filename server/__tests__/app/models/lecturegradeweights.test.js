const db = require('../../../app/models')

describe("LectureGradeWeights model", () => {
    let lecture, lectureGradeWeight;

    beforeAll(async () => {
        const course = await db.Course.create({
            name: "Physics 101",
            description: "An introductory physics course"
        });

        lecture = await db.Lecture.create({
            title: "Newton's Laws",
            description: "A lecture on Newton's Laws",
            courseId: course.id
        });
    });

    describe("LectureGradeWeights.create", () => {
        it("should create a valid lecture grade weight", async () => {
            lectureGradeWeight = await db.LectureGradeWeights.create({
                lectureId: lecture.id,
                weight: 0.5
            });

            expect(lectureGradeWeight.lectureId).toEqual(lecture.id);
            expect(lectureGradeWeight.weight).toEqual(0.5);
        });

        it("should reject a weight below zero", async () => {
            await expect(db.LectureGradeWeights.create({
                lectureId: lecture.id,
                weight: -0.1
            })).rejects.toThrow("Validation error: Weight must be a positive value");
        });

        it("should reject a weight above 1", async () => {
            await expect(db.LectureGradeWeights.create({
                lectureId: lecture.id,
                weight: 1.5
            })).rejects.toThrow("Validation error: Weight cannot be greater than 1");
        });

        it("should reject a lecture grade weight without a lectureId", async () => {
            await expect(db.LectureGradeWeights.create({
                weight: 0.7
            })).rejects.toThrow("notNull Violation: LectureGradeWeight must be associated with a lecture");
        });
    });

    afterAll(async () => {
        await lectureGradeWeight.destroy();
    });
});
