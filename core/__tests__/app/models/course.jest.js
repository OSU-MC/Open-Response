"use strict";
const db = require("../../../app/models");
const moment = require("moment");

describe("Course model", () => {
    let course;

    describe("Course.create", () => {
        it("should create a valid course record with default values", async () => {
            const course = await db.Course.create({
                name: "PH201: Introduction to Physics",
                description: "An introduction to physics concepts, such as kinematics, Newton's Laws, and more."
            });

            expect(course.name).toEqual("PH201: Introduction to Physics");
            expect(course.description).toEqual("An introduction to physics concepts, such as kinematics, Newton's Laws, and more.");
            expect(course.publishedAt).toBeNull(); // Ensure default publishedAt is null
            expect(course.softDelete).toBeFalsy(); // Ensure soft delete defaults to false
            await course.destroy();
        });

        it("should create a valid course record with a published date", async () => {
            const publishedAt = new Date();
            const course = await db.Course.create({
                name: "PH201: Introduction to Physics",
                description: "An introduction to physics concepts, such as kinematics, Newton's Laws, and more.",
                publishedAt
            });

            expect(course.name).toEqual("PH201: Introduction to Physics");
            expect(course.description).toEqual("An introduction to physics concepts, such as kinematics, Newton's Laws, and more.");
            expect(new Date(course.publishedAt).getTime()).toBeCloseTo(publishedAt.getTime(), -2); // Fix precision issue
            expect(course.softDelete).toBeFalsy();
            await course.destroy();
        });

        it("should reject a null course name", async () => {
            await expect(
                db.Course.create({
                    description: "An introduction to physics concepts, such as kinematics, Newton's Laws, and more."
                })
            ).rejects.toThrow("notNull Violation: Course name required");
        });

        it("should reject an empty course name", async () => {
            await expect(
                db.Course.create({
                    name: "",
                    description: "An introduction to physics concepts, such as kinematics, Newton's Laws, and more."
                })
            ).rejects.toThrow("Validation error: Course name cannot be empty");
        });

        it("should reject an empty course description", async () => {
            await expect(
                db.Course.create({
                    name: "PH201: Introduction to Physics",
                    description: ""
                })
            ).rejects.toThrow("Validation error: Course description, if it exists, cannot be empty");
        });

        it("should accept a null course description", async () => {
            const course = await db.Course.create({
                name: "PH201: Introduction to Physics"
            });

            expect(course.name).toEqual("PH201: Introduction to Physics");
            expect(course.description).toBeUndefined();
            expect(course.publishedAt).toBeNull();
            expect(course.softDelete).toBeFalsy();
            await course.destroy();
        });

        it("should reject a description over 500 characters", async () => {
            await expect(
                db.Course.create({
                    name: "PH201: Introduction to Physics",
                    description: "A".repeat(501) // Ensures 501 characters
                })
            ).rejects.toThrow("Validation error: Course description must be less than or equal to 500 characters");
        });

        it("should reject a name over 50 characters", async () => {
            await expect(
                db.Course.create({
                    name: "PH201: Introduction to Physics with labs and lectures that happen for 4 days of the week",
                    description: "An introduction to physics concepts, such as kinematics, Newton's Laws, and more."
                })
            ).rejects.toThrow("Validation error: Course name must be less than or equal to 50 characters");
        });
    });

    describe("Course.update", () => {
        beforeEach(async () => {
            course = await db.Course.create({
                name: "PH201: Introduction to Physics",
                description: "An introduction to physics concepts, such as kinematics, Newton's Laws, and more."
            });
        });

        it("should update the course name", async () => {
            await course.update({ name: "PH202: Introduction to Physics II" });
            await expect(course.save()).resolves.toBeTruthy();
            await course.reload();
            expect(course.name).toEqual("PH202: Introduction to Physics II");
        });

        it("should update the description", async () => {
            await course.update({ description: "This is the second course in the physics 20x series." });
            await expect(course.save()).resolves.toBeTruthy();
            await course.reload();
            expect(course.description).toEqual("This is the second course in the physics 20x series.");
        });

        it("should update the publishedAt status", async () => {
            const publishedAt = moment().utc();
            await course.update({ publishedAt });
            await expect(course.save()).resolves.toBeTruthy();
            await course.reload();
        
            expect(moment(course.publishedAt).utc().isSame(publishedAt, 'second')).toBe(true);
        });

        it("should update the published status", async () => {
            await course.update({ published:true });
            await expect(course.save()).resolves.toBeTruthy();
            await course.reload();
        
            expect(course.published).toBe(true);
        });
        

        it("should soft delete a course", async () => {
            await course.update({ softDelete: true });
            await expect(course.save()).resolves.toBeTruthy();
            await course.reload();
            expect(course.softDelete).toBeTruthy();
        });

        afterEach(async () => {
            await course.destroy();
        });
    });
});