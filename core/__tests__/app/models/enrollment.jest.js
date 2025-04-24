"use strict";
const db = require("../../../app/models");

describe("Enrollment model", () => {
    let course, section, user;

    beforeAll(async () => {
        try {
            // Ensure a valid user exists
            user = await db.User.create({
                firstName: "Dan",
                lastName: "Smith",
                email: `danSmith_${Date.now()}@open-response.org`, // Unique email to avoid conflicts
                isTeacher: true,
                rawPassword: "Danny-o123!"
            });

            // Ensure a valid course exists
            course = await db.Course.create({
                name: "PH202: Introduction to Physics",
                description: "An introduction to physics concepts, such as kinematics, Newton's Laws, and more."
            });

            // Ensure a valid section exists
            section = await db.Section.create({
                number: 16,
                joinCode: "1yhs19",
                courseId: course.id
            });

        } catch (error) {
            console.error("Error in beforeAll setup:", error);
        }
    });

    describe("Enrollment.create", () => {
        it("should create a valid enrollment record with student role", async () => {
            const enrollment = await db.Enrollment.create({
                role: "student",
                sectionId: section.id,
                userId: user.id
            });

            expect(enrollment.role).toEqual("student");
            expect(enrollment.sectionId).toEqual(section.id);
            expect(enrollment.userId).toEqual(user.id);
            expect(enrollment.softDelete).toBeFalsy();
            expect(enrollment.softUnenroll).toBeFalsy();
            await enrollment.destroy();
        });

        it("should create a valid enrollment record with teacher role", async () => {
            const enrollment = await db.Enrollment.create({
                role: "teacher",
                courseId: course.id,
                userId: user.id
            });

            expect(enrollment.role).toEqual("teacher");
            expect(enrollment.courseId).toEqual(course.id);
            expect(enrollment.userId).toEqual(user.id);
            await enrollment.destroy();
        });

        it("should reject an enrollment with a role that isn't valid", async () => {
            await expect(db.Enrollment.create({
                role: "invalid_role",
                courseId: course.id,
                userId: user.id
            })).rejects.toThrow("Validation error: Validation isIn on role failed");
        });

        it("should reject a teacher with a section and no course", async () => {
            await expect(db.Enrollment.create({
                role: "teacher",
                sectionId: section.id,
                userId: user.id
            })).rejects.toThrow("Validation error: A teacher cannot be enrolled at the section level");
        });

        it("should reject a duplicate enrollment", async () => {
            const enrollment = await db.Enrollment.create({
                role: "student",
                sectionId: section.id,
                userId: user.id
            });

            await expect(db.Enrollment.create({
                role: "student",
                sectionId: section.id,
                userId: user.id
            })).rejects.toThrow("Validation error");
            await enrollment.destroy();
        });
    });

    describe("Enrollment.update", () => {
        let enrollment;

        beforeEach(async () => {
            enrollment = await db.Enrollment.create({
                role: "student",
                sectionId: section.id,
                userId: user.id
            });
        });

        it("should update the enrollment role", async () => {
            await enrollment.update({ role: "ta" });
            await enrollment.reload();
            expect(enrollment.role).toEqual("ta");
        });

        it("should soft delete an enrollment", async () => {
            await enrollment.update({ softDelete: true });
            await enrollment.reload();
            expect(enrollment.softDelete).toBeTruthy();
        });

        it("should soft unenroll a student", async () => {
            await enrollment.update({ softUnenroll: true });
            await enrollment.reload();
            expect(enrollment.softUnenroll).toBeTruthy();
        });

        afterEach(async () => {
            if (enrollment) await enrollment.destroy();
        });
    });

    afterAll(async () => {
        try {
            await db.Enrollment.destroy({ where: {} });
            if (user) await user.destroy();
            if (course) await course.destroy();
            if (section) await section.destroy();
        } catch (error) {
            console.error("Error in afterAll cleanup:", error);
        }
    });
});