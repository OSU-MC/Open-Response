const db = require('../../../app/models')

describe("LectureGradeWeight model", () => {
    let course, lecture, lectureGradeWeight;

    beforeAll(async () => {
        course = await db.Course.create({
            name: "Physics 101",
            description: "An introductory physics course"
        });

        lecture = await db.Lecture.create({
            title: "Newton's Laws",
            description: "A lecture on Newton's Laws",
            courseId: course.id
        });
    });

    describe("LectureGradeWeight.create", () => {
        it("should create a valid lecture grade weight", async () => {
            lectureGradeWeight = await db.LectureGradeWeight.create({
                lectureId: lecture.id,
                weight: 0.5
            });

            expect(lectureGradeWeight.lectureId).toEqual(lecture.id);
            expect(lectureGradeWeight.weight).toEqual(0.5);
        });

        it("should reject a weight below zero", async () => {
            await expect(db.LectureGradeWeight.create({
                lectureId: lecture.id,
                weight: -0.1
            })).rejects.toThrow("Validation error: Weight must be greater than 0");
        });

        it("should reject a weight of exactly 0", async () => {
            await expect(db.LectureGradeWeight.create({
                lectureId: lecture.id,
                weight: 0
            })).rejects.toThrow("Validation error: Weight must be greater than 0");
        });

        it("should reject a lecture grade weight without a lectureId", async () => {
            await expect(db.LectureGradeWeight.create({
                weight: 0.7
            })).rejects.toThrow("notNull Violation: LectureGradeWeight.lectureId cannot be null");
        });
    });

    afterAll(async () => {
        if (lectureGradeWeight) await lectureGradeWeight.destroy();
        await lecture.destroy();
        await course.destroy();
    });
});
