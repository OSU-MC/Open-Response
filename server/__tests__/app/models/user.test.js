const db = require('../../../app/models')
const moment = require('moment')

const { welcome, confirmation, passwordReset } = require('../../../lib/mailer')

jest.mock('../../../lib/mailer', () => ({
    ...(jest.requireActual('../../../lib/mailer')),
    welcome: jest.fn(),
    confirmation: jest.fn(),
    passwordReset: jest.fn()
}))

describe("User model", () => {

    let user 

    describe("User.create", () => {
        it("should create a valid user record with default values", async () => {
            jest.clearAllMocks()
            user = await db.User.create({
                firstName: 'Dan',
                lastName: 'Smith',
                email: 'danSmith@myclassroom.com',
                rawPassword: 'Danny-o123!',
                isTeacher: true
            })
            expect(user.rawPassword).toEqual("Danny-o123!")
            user = await user.reload()
            expect(user.firstName).toEqual("Dan")
            expect(user.lastName).toEqual("Smith")
            expect(user.fullName).toEqual("Dan Smith")
            expect(user.email).toEqual("danSmith@myclassroom.com")
            expect(user.rawPassword).toBeUndefined()
            expect(user.password).not.toEqual("Danny-o123!")
            expect(user.admin).toBeFalsy()
            expect(user.failedLoginAttempts).toEqual(0)
            expect(user.lastLogin).toBeFalsy()
            expect(user.emailConfirmed).toBeFalsy()
            expect(user.softDelete).toBeFalsy() // Ensure soft delete defaults to false
            expect(welcome).toHaveBeenCalledWith(user)
            expect(welcome).toHaveBeenCalledTimes(1)
            expect(confirmation).toHaveBeenCalledWith(user)
            expect(confirmation).toHaveBeenCalledTimes(1)
            await user.destroy()
        })

        it("should soft delete a user", async () => {
            user = await db.User.create({
                firstName: 'Dan',
                lastName: 'Smith',
                email: 'danSmith@myclassroom.com',
                rawPassword: 'Danny-o123!',
                isTeacher: true
            })
            await user.update({ softDelete: true })
            await expect(user.save()).resolves.toBeTruthy()
            await user.reload()
            expect(user.softDelete).toBeTruthy()
            await user.destroy()
        })

        it("should reject a null firstName", async () => {
            await expect(db.User.create({
                lastName: 'Smith',
                email: 'dannySmith@myclassroom.com',
                rawPassword: 'Danny-o123!',
            })).rejects.toThrow("notNull Violation: First name required")
        })
    })

    describe("User.update", () => {

        beforeEach(async () => {
            user = await db.User.create({
                firstName: 'Dan',
                lastName: 'Smith',
                email: 'dannySmith@myclassroom.com',
                rawPassword: 'Danny-o123!',
                isTeacher: true
            })
        })

        it("should update the name", async () => {
            await user.update({ firstName: "Danny" })
            await expect(user.save()).resolves.toBeTruthy()
            await user.reload()
            expect(user.firstName).toEqual("Danny")
        })

        it("should update the email", async () => {
            await user.update({ email: "danSmithy@myclassroom.com" })
            await expect(user.save()).resolves.toBeTruthy()
            await user.reload()
            expect(user.email).toEqual("danSmithy@myclassroom.com")
        })

        afterEach(async () => {
            await user.destroy()
        })
    })

    describe("validatePassword", () => {
        beforeAll(async () => {
            user = await db.User.create({
                firstName: 'Dan',
                lastName: 'Smith',
                email: 'dannySmith@myclassroom.com',
                rawPassword: 'Danny-o123!'
            })
        })

        it("should validate that the password is correct", () => {
            expect(user.validatePassword("Danny-o123!")).toEqual(true)
        })

        it("should validate that the password is incorrect", () => {
            expect(user.validatePassword("Danny-o1234!")).toEqual(false)
        })

        afterAll(async () => {
            await user.destroy()
        })
    })

    describe("Email Confirmation", () => {
        let code

        beforeAll(async () => {
            user = await db.User.create({
                firstName: 'Dan',
                lastName: 'Smith',
                email: 'dannySmith@myclassroom.com',
                rawPassword: 'Danny-o123!'
            })
        })

        it("should set the email expiration and code", async () => {
            jest.clearAllMocks()
            const now = moment().utc()
            code = await user.generateEmailConfirmation()
            expect(user.emailConfirmationCode).toEqual(code)
            expect(user.emailConfirmationCode).not.toBeNull()
            expect(user.emailConfirmationExpired()).toEqual(false)
            expect((now.minutes() + 5) % 60).toEqual(moment(user.emailConfirmationExpiresAt).minutes())
            expect(confirmation).toHaveBeenCalledTimes(1)
            expect(confirmation).toHaveBeenCalledWith(user)
        })

        it("should validate that the email confirmation is correct", async () => {
            const confirmed = await user.confirmEmail(code)
            expect(confirmed).toEqual(true)
            expect(user.emailConfirmationExpired()).toEqual(false)
            expect(user.emailConfirmed).toEqual(true)
        })

        afterAll(async () => {
            await user.destroy()
        })
    })

    describe("Password Reset", () => {
        let code

        beforeAll(async () => {
            user = await db.User.create({
                firstName: 'Dan',
                lastName: 'Smith',
                email: 'dannySmith@myclassroom.com',
                rawPassword: 'Danny-o123!'
            })
        })

        it("should set the password expiration, code, and initiated value", async () => {
            const now = moment().utc()
            code = await user.generatePasswordReset()
            expect(user.passwordResetCode).toEqual(code)
            expect(user.passwordResetCode).not.toBeNull()
            expect(user.passwordResetInitiated).toBeTruthy()
            expect(user.passwordResetExpired()).toBeFalsy()
            expect((now.minutes() + 5) % 60).toEqual(moment(user.passwordResetExpiresAt).minutes())
        })

        it("should validate that the password confirmation is correct", async () => {
            expect(await user.validatePasswordReset(code)).toBeTruthy()
            expect(user.passwordResetExpired()).toBeFalsy()
            expect(user.passwordResetInitiated).toBeFalsy()
        })

        it("should correctly compute an expired password reset", async () => {
            await user.setPasswordResetExpires()
            await user.save()
            expect(user.passwordResetInitiated).toBeTruthy()
            expect(user.passwordResetExpired()).toEqual(true)
        })

        afterAll(async () => {
            await user.destroy()
        })
    })
})
