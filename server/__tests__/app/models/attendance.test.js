const db = require('../../../app/models')

describe("Attendance model", () => {
    let enrollment, lectureForSection, attendance;

    beforeAll(async () => {
        const user = await db.User.create({
            firstName: "John",
            lastName: "Doe",
            email: "johndoe@myclassroom.com",
            rawPassword: "SecurePassword123!"
        });

        const course = await db.Course.create({
            name: "Intro to Testing",
            description: "A course on how to test things"
        });

        const section = await db.Section.create({
            number: 101,
            courseId: course.id
        });

        enrollment = await db.Enrollment.create({
            role: "student",
            sectionId: section.id,
            userId: user.id
        });

        const lecture = await db.Lecture.create({
            title: "Lecture 1",
            description: "Introduction to testing",
            courseId: course.id
        });

        lectureForSection = await db.LectureForSection.create({
            lectureId: lecture.id,
            sectionId: section.id,
            attendanceMethod: "join"
        });
    });

    describe("Attendance.create", () => {
        it("should create a valid attendance record", async () => {
            attendance = await db.Attendance.create({
                enrollmentId: enrollment.id,
                lectureForSectionId: lectureForSection.id,
                joinedLecture: true,
                joinedLectureBy: new Date(),
                attendance: true
            });

            expect(attendance.enrollmentId).toEqual(enrollment.id);
            expect(attendance.lectureForSectionId).toEqual(lectureForSection.id);
            expect(attendance.joinedLecture).toBeTruthy();
            expect(attendance.attendance).toBeTruthy();
            if (attendance) await attendance.destroy();
        });

        it("should default `joinedLecture` and `attendance` to false", async () => {
            const att = await db.Attendance.create({
                enrollmentId: enrollment.id,
                lectureForSectionId: lectureForSection.id,
            });

            expect(att.joinedLecture).toBeFalsy();
            expect(att.attendance).toBeFalsy();
            await att.destroy();
        });

        it("should reject an attendance record without `enrollmentId`", async () => {
            await expect(db.Attendance.create({
                lectureForSectionId: lectureForSection.id
            })).rejects.toThrow("notNull Violation: Attendance.enrollmentId cannot be null");
        });

        it("should reject an attendance record without `lectureForSectionId`", async () => {
            await expect(db.Attendance.create({
                enrollmentId: enrollment.id
            })).rejects.toThrow("notNull Violation: Attendance.lectureForSectionId cannot be null");
        });
    });

    afterAll(async () => {
        if (attendance) await attendance.destroy();
    });
});
