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

    let user //declare user so it can be accessed in all the following tests, where necessary

    describe("User.create", () => {
        it ("should create a valid user record with default values", async () => {
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
            expect(welcome).toHaveBeenCalledWith(user)
            expect(welcome).toHaveBeenCalledTimes(1)
            expect(confirmation).toHaveBeenCalledWith(user)
            expect(confirmation).toHaveBeenCalledTimes(1)
            await user.destroy()
        })
    
        it ("should reject a null firstName", async () => {
            await expect(db.User.create({
                lastName: 'Smith',
                email: 'dannySmith@myclassroom.com',
                rawPassword: 'Danny-o123!',
            })).rejects.toThrow("notNull Violation: First name required")
        })
    
        it ("should reject an empty firstName", async () => {
            await expect(db.User.create({
                firstName: '',
                lastName: 'Smith',
                email: 'dannySmith@myclassroom.com',
                rawPassword: 'Danny-o123!',
            })).rejects.toThrow("Validation error: First name cannot be empty")
        })
    
        it ("should reject a null lastName", async () => {
            await expect(db.User.create({
                firstName: 'Dan',
                email: 'dannySmith@myclassroom.com',
                rawPassword: 'Danny-o123!',
            })).rejects.toThrow("notNull Violation: Last name required")
        })
    
        it ("should reject an empty lastName", async () => {
            await expect(db.User.create({
                firstName: 'Dan',
                lastName: '',
                email: 'dannySmith@myclassroom.com',
                rawPassword: 'Danny-o123!',
            })).rejects.toThrow("Validation error: Last name cannot be empty")
        })
    
        it ("should reject a non-unique email", async () => {
            const user = await db.User.create({
                firstName: 'Dan',
                lastName: 'Smith',
                email: 'danSmith@myclassroom.com',
                rawPassword: 'Danny-o123!',
            })
            await expect(db.User.create({
                firstName: 'Dan',
                lastName: 'Smith',
                email: 'danSmith@myclassroom.com',
                rawPassword: 'Danny-o123!',
            })).rejects.toThrow("Validation error")
            await user.destroy()
        })
    
        it ("should reject a invalid email address", async () => {
            await expect(db.User.create({
                firstName: 'Dan',
                lastName: 'Smith',
                email: 'danSmith.com',
                rawPassword: 'Danny-o123!',
            })).rejects.toThrow("Validation error: Invalid email")
        })
    
        it ("should reject a null rawPassword", async () => {
            await expect(db.User.create({
                firstName: 'Dan',
                lastName: 'Smith',
                email: 'dannySmith@myclassroom.com'
            })).rejects.toThrow("notNull Violation: Password cannot be null")
        })

        it ("should reject a rawPassword that is too short", async () => {
            await expect(db.User.create({
                firstName: 'Dan',
                lastName: 'Smith',
                email: 'dannySmith@myclassroom.com',
                rawPassword: 'Danny-o!'
            })).rejects.toThrow("Validation error: Password must be 11-32 characters")
        })

        it ("should reject a rawPassword that is too long", async () => {
            await expect(db.User.create({
                firstName: 'Dan',
                lastName: 'Smith',
                email: 'dannySmith@myclassroom.com',
                rawPassword: 'Danny-o!Danny-o!Danny-o!Danny-o!!'
            })).rejects.toThrow("Validation error: Password must be 11-32 characters")
        })

        it ("should reject an email that does not match the domain constraint", async() => {
            await expect(db.User.create({
                firstName: 'Dan',
                lastName: 'Smith',
                email: 'dannySmith@gmail.com',
                rawPassword: 'Danny-o!Danny-o!Danny-o!Danny-o!!'
            })).rejects.toThrow("Validation error: Email must be within the domain set by the system admin")
        })
    })

    describe("User.update", () => {

        beforeEach(async() => {
            user = await db.User.create({
                firstName: 'Dan',
                lastName: 'Smith',
                email: 'dannySmith@myclassroom.com',
                rawPassword: 'Danny-o123!',
                isTeacher: true
            })
        })

        it ("should update the name", async () => {
            await user.update({firstName: "Danny"})
            await expect(user.save()).resolves.toBeTruthy()
            await user.reload() // reloads the instance from the database after the update into the user variables
            expect(user.firstName).toEqual("Danny")
        })

        it ("should update the email", async () => {
            await user.update({email: "danSmithy@myclassroom.com"})
            await expect(user.save()).resolves.toBeTruthy()
            await user.reload()
            expect(user.email).toEqual("danSmithy@myclassroom.com")
        })

        it ("should update the password", async () => {
            const password = user.password
            await user.update({rawPassword: "Danny-o1234!"})
            await expect(user.save()).resolves.toBeTruthy()
            await user.reload() // the reload will clear rawPassword because it is virtual and not stored in the database
            expect(user.password).not.toEqual(password)
            expect(user.password).not.toEqual(user.rawPassword)
        })

        it ("should reject an email update with an existing email", async () => {
            const user2 = await db.User.create({
                firstName: 'Dan',
                lastName: 'Smith',
                email: 'danSmith@myclassroom.com',
                rawPassword: 'Danny-o123!'
            })
            await expect(user.update({email: "danSmith@myclassroom.com"})).rejects.toThrow("Validation error")
            await user.reload() 
            expect(user.email).toEqual("dannySmith@myclassroom.com")
            await user2.destroy()
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

        it ("should validate that the password is correct", () => {
            expect(user.validatePassword("Danny-o123!")).toEqual(true)
        })

        it ("should validate that the password is incorrect", () => {
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

        it ("should set the email expiration and code", async () => {
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

        it ("should validate that the email confirmation is correct", async () => {
            const confirmed = await user.confirmEmail(code)
            expect(confirmed).toEqual(true)
            expect(user.emailConfirmationExpired()).toEqual(false)
            expect(user.emailConfirmed).toEqual(true)
        })

        it ("should invalidate the email confirmation because of incorrect code", async () => {
            const confirmed = await user.confirmEmail('A12345')
            expect(confirmed).toEqual(false)
            expect(user.emailConfirmationExpired()).toEqual(false)
            expect(user.emailConfirmed).toEqual(false)
        })

        it ("should correctly compute an expired confirmation", async () => {
            user.emailConfirmationExpiresAt = moment().utc()
            expect(user.emailConfirmationExpired()).toBeTruthy()
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

        it ("should set the password expiration, code, and initiated value", async () => {
            const now = moment().utc()
            code = await user.generatePasswordReset()
            expect(user.passwordResetCode).toEqual(code)
            expect(user.passwordResetCode).not.toBeNull()
            expect(user.passwordResetInitiated).toBeTruthy()
            expect(user.passwordResetExpired()).toBeFalsy()
            expect((now.minutes() + 5) % 60).toEqual(moment(user.passwordResetExpiresAt).minutes())
        })

        it ("should validate that the password confirmation is correct", async () => {
            expect(await user.validatePasswordReset(code)).toBeTruthy()
            expect(user.passwordResetExpired()).toBeFalsy()
            expect(user.passwordResetInitiated).toBeFalsy()
        })

        it ("should invalidate the password reset because of incorrect code", async () => {
            expect(await user.validatePasswordReset('A12345')).toBeFalsy()
            expect(user.passwordResetExpired()).toBeFalsy()
            expect(user.passwordResetInitiated).toBeTruthy()
        })

        it ("should correctly compute an expired password reset", async () => {
            user.passwordResetExpiresAt = moment().utc()
            await user.save()
            expect(user.passwordResetInitiated).toBeTruthy()
            expect(user.passwordResetExpired()).toEqual(true)
        })

        afterAll(async () => {
            await user.destroy()
        })
    })
})