const app = require('../../../app/app')
const db = require('../../../app/models')
const { logger } = require('../../../lib/logger')
const jwtUtils = require('../../../lib/jwt_utils')
const request = require('supertest')
const moment = require('moment')
const { generateUserSession } = require('../../../lib/auth')

describe('POST /users', () => {
    it('should respond with 201 and user information', async () => {
        const resp = await request(app).post('/users').send({
            firstName: "Memey",
            lastName: "Meme",
            email: "MemeyMeme@myclassroom.com",
            rawPassword: "TheMemeiestSecret",
            isTeacher: true,
            confirmedPassword: "TheMemeiestSecret"
        })
        expect(resp.statusCode).toEqual(201)
        expect(resp.body.user.firstName).toEqual("Memey")
        expect(resp.body.user.lastName).toEqual("Meme")
        expect(resp.body.user.email).toEqual("MemeyMeme@myclassroom.com")
        
    })

    it('should respond with 400 and missing fields', async () => {
        const resp = await request(app).post('/users').send({
            firstName: "Memey",
            email: "MemeyMeme@myclassroom.com",
            rawPassword: "TheMemeiestSecret",
        })
        expect(resp.statusCode).toEqual(400)
        expect(resp.body.error).toEqual("Missing fields required to create user: lastName, isTeacher, confirmedPassword")
    })

    it('should respond with 400 and message that passwords do not match', async () => {
        const resp = await request(app).post('/users').send({
            firstName: "Memer",
            lastName: "Memey",
            email: "MemeyMemer123@myclassroom.com",
            rawPassword: "TheMemeiestSecret",
            isTeacher: true,
            confirmedPassword: "TheMemeiestSecret123"
        })
        expect(resp.statusCode).toEqual(400)
        expect(resp.body.error).toEqual("Password & confirmed password do not match")
    })

    it('should respond with 400 and message that email already exists', async () => {
        const resp = await request(app).post('/users').send({
            firstName: "Memer",
            lastName: "Memey",
            email: "MemeyMeme@myclassroom.com",
            rawPassword: "TheMemeiestSecret123",
            isTeacher: true,
            confirmedPassword: "TheMemeiestSecret123"
        })
        expect(resp.statusCode).toEqual(400)
        expect(resp.body.error).toEqual("An account associated with that email already exists")
    })

    it('should respond with 400 and validation errors', async () => {
        const resp = await request(app).post('/users').send({
            firstName: "Memer",
            lastName: "",
            email: "MemeyMemer123@myclassroom",
            rawPassword: "TheMemeiestSecret123",
            isTeacher: true,
            confirmedPassword: "TheMemeiestSecret123"
        })
        expect(resp.statusCode).toEqual(400)
        expect(resp.body.error).toContain("Invalid email")
        expect(resp.body.error).toContain("Last name cannot be empty")
    })
})

describe('POST /users/login', () => {

    it('should respond with 200 and status = 2', async () => {
        const user = await db.User.create({
            firstName: "Login",
            lastName: "Tester",
            email: "loginTester1@myclassroom.com",
            rawPassword: "loginTester123!",
            isTeacher: true,
            confirmedPassword: "loginTester123!"
        })
        const resp = await request(app).post('/users/login').send({
            email: "loginTester1@myclassroom.com",
            rawPassword: "loginTester123!"
        })
        expect(resp.statusCode).toEqual(200)
        expect(resp.body.user.firstName).toEqual("Login")
        expect(resp.body.user.lastName).toEqual("Tester")
        expect(resp.body.user.email).toEqual("loginTester1@myclassroom.com")
        
        expect(resp.body.message).toEqual("This account email has not been confirmed. You cannot recover your account in the case of a lost password unless you confirm your email.")
        await user.destroy()
    })

    it('should respond with 200 and status = 0', async () => {
        const user = await db.User.create({
            firstName: "Login",
            lastName: "Tester",
            email: "loginTester2@myclassroom.com",
            rawPassword: "loginTester123!",
            isTeacher: true,
            confirmedPassword: "loginTester123!",
            emailConfirmed: true
        })
        const resp = await request(app).post('/users/login').send({
            email: "loginTester2@myclassroom.com",
            rawPassword: "loginTester123!",
        })
        expect(resp.statusCode).toEqual(200)
        expect(resp.body.user.firstName).toEqual("Login")
        expect(resp.body.user.lastName).toEqual("Tester")
        expect(resp.body.user.email).toEqual("loginTester2@myclassroom.com")
        
        expect(resp.body.message).toEqual("")
        await user.destroy()
    })

    it('should respond with 200 and status = 1', async () => {
        const user = await db.User.create({
            firstName: "Login",
            lastName: "Tester",
            email: "loginTester3@myclassroom.com",
            rawPassword: "loginTester123!",
            confirmedPassword: "loginTester123!",
            isTeacher: true,
            emailConfirmed: true,
            passwordResetInitiated: true
        })
        const resp = await request(app).post('/users/login').send({
            email: "loginTester3@myclassroom.com",
            rawPassword: "loginTester123!",
        })
        expect(resp.statusCode).toEqual(200)
        expect(resp.body.user.firstName).toEqual("Login")
        expect(resp.body.user.lastName).toEqual("Tester")
        expect(resp.body.user.email).toEqual("loginTester3@myclassroom.com")
        
        expect(resp.body.message).toEqual("A password reset has been initiated for this account, but the password has not been reset")
        await user.destroy()
    })

    it('should respond with 404 and message that email does not exist', async () => {
        const resp = await request(app).post('/users/login').send({
            email: "abc123@myclassroom.com",
            rawPassword: "loginTester123!",
        })
        expect(resp.statusCode).toEqual(404)
        expect(resp.body.error).toEqual('No account found with email: abc123@myclassroom.com')
    })

    it('should respond with 401 and message that account is locked', async () => {
        const user = await db.User.create({
            firstName: "Login",
            lastName: "Tester",
            email: "loginTester4@myclassroom.com",
            rawPassword: "loginTester123!",
            isTeacher: true,
            confirmedPassword: "loginTester123!",
            failedLoginAttempts: 3
        })
        const resp = await request(app).post('/users/login').send({
            email: "loginTester4@myclassroom.com",
            rawPassword: "loginTester123!",
        })
        expect(resp.statusCode).toEqual(401)
        expect(resp.body.error).toEqual('This account has been locked until the password is reset. An email should have been sent with instructions')
        await user.destroy()
    })

    it('should respond with 401 and message that account is now locked', async () => {
        let user = await db.User.create({
            firstName: "Login",
            lastName: "Tester",
            email: "loginTester5@myclassroom.com",
            isTeacher: true,
            rawPassword: "loginTester123!",
            confirmedPassword: "loginTester123!",
            failedLoginAttempts: 2
        })
        const resp = await request(app).post('/users/login').send({
            email: "loginTester5@myclassroom.com",
            rawPassword: "loginTester123",
        })
        expect(resp.statusCode).toEqual(401)
        expect(resp.body.error).toEqual('Incorrect password. Your account has been locked. You will need to reset your password before logging in. An email should have been sent to your inbox')
        await user.reload()
        expect(user.failedLoginAttempts).toEqual(3)
        await user.destroy()
    })

    it('should respond with 401 and message that account has 2 remaining tries', async () => {
        let user = await db.User.create({
            firstName: "Login",
            lastName: "Tester",
            email: "loginTester6@myclassroom.com",
            isTeacher: true,
            rawPassword: "loginTester123!",
            confirmedPassword: "loginTester123!"
        })
        const resp = await request(app).post('/users/login').send({
            email: "loginTester6@myclassroom.com",
            rawPassword: "loginTester123",
        })
        expect(resp.statusCode).toEqual(401)
        expect(resp.body.error).toEqual('Incorrect password. Your account will be locked after 2 more unsuccessful attempts')
        await user.reload()
        expect(user.failedLoginAttempts).toEqual(1)
        await user.destroy()
    })
})

describe('PUT /users', () => {

    let user

    beforeEach(async () => {
        user = await db.User.create({
            firstName: 'password',
            lastName: 'resetter',
            email: 'passwordresetter@myclassroom.com',
            rawPassword: 'toberesetuhoh!',
            isTeacher: true,
            confirmedPassword: 'toberesetuhoh!',
            failedLoginAttempts: 1
        })
    })

    it('should respond with 200 and reset the password successfully', async () => {
        const code = await user.generatePasswordReset()
        const resp = await request(app).put('/users').send({
            email: 'passwordresetter@myclassroom.com',
            passwordResetCode: code,
            rawPassword: 'newresetpassword!',
            confirmedPassword: 'newresetpassword!'
        })
        expect(resp.statusCode).toEqual(200)
        expect(resp.body.user.email).toEqual('passwordresetter@myclassroom.com')
        expect(resp.body.user.firstName).toEqual('password')
        expect(resp.body.user.lastName).toEqual('resetter')
        await user.reload()
        expect(user.validatePassword('newresetpassword!'))
        expect(user.passwordResetInitiated).toEqual(false)
        expect(user.failedLoginAttempts).toEqual(0)
        expect(moment(user.lastLogin).isBetween(moment().subtract(1, 'seconds').utc(), moment().add(1, 'seconds').utc()))
    })

    it('should respond with 400 and missing fields for request', async () => {
        const code = await user.generatePasswordReset()
        const resp = await request(app).put('/users').send({
            email: 'passwordresetter@myclassroom.com',
            rawPassword: 'newresetpassword!',
            isTeacher: true,
            confirmedPassword: 'newresetpassword!'
        })
        expect(resp.statusCode).toEqual(400)
        expect(resp.body.error).toEqual('Missing fields required to reset password: passwordResetCode')
    })

    it('should respond with 404 and email not found', async () => {
        const code = await user.generatePasswordReset()
        const resp = await request(app).put('/users').send({
            email: 'passwordresette@myclassroom.com',
            passwordResetCode: code,
            rawPassword: 'newresetpassword!',
            isTeacher: true,
            confirmedPassword: 'newresetpassword!'
        })
        expect(resp.statusCode).toEqual(404)
        expect(resp.body.error).toEqual('No account with that email exists')
    })
    
    it('should respond with 401 and invalid credentials', async () => {
        const resp = await request(app).put('/users').send({
            email: 'passwordresetter@myclassroom.com',
            passwordResetCode: "abc123",
            rawPassword: 'newresetpassword!',
            isTeacher: true,
            confirmedPassword: 'newresetpassword!'
        })
        expect(resp.statusCode).toEqual(401)
        expect(resp.body.error).toEqual('Invalid credentials provided')
    })

    it('should respond with 401 and credentials expired', async () => {
        const code = await user.generatePasswordReset()
        user.passwordResetExpiresAt = moment().utc()
        await user.save()
        const resp = await request(app).put('/users').send({
            email: 'passwordresetter@myclassroom.com',
            passwordResetCode: code,
            rawPassword: 'newresetpassword!',
            isTeacher: true,
            confirmedPassword: 'newresetpassword!'
        })
        expect(resp.statusCode).toEqual(401)
        expect(resp.body.error).toEqual('Credentials expired. Please request new credentials and try again')
    })

    it('should respond with 400 and passwords do not match', async () => {
        const code = await user.generatePasswordReset()
        const resp = await request(app).put('/users').send({
            email: 'passwordresetter@myclassroom.com',
            passwordResetCode: code,
            rawPassword: 'newresetpassword!',
            isTeacher: true,
            confirmedPassword: 'newresetpassword'
        })
        expect(resp.statusCode).toEqual(400)
        expect(resp.body.error).toEqual('Passwords do not match')
    })

    it('should respond with 400 and password validation when too short', async () => {
        const code = await user.generatePasswordReset()
        const resp = await request(app).put('/users').send({
            email: 'passwordresetter@myclassroom.com',
            passwordResetCode: code,
            rawPassword: 'newpass',
            isTeacher: true,
            confirmedPassword: 'newpass'
        })
        expect(resp.statusCode).toEqual(400)
        expect(resp.body.error).toContain('Password must be 11-32 characters')
    })

    afterEach(async () => {
        await user.destroy()
    })
})

describe('PUT /users/password', () => {

    let user

    beforeAll(async () => {
        user = await db.User.create({
            firstName: 'password',
            lastName: 'resetreq',
            email: 'requestpassreset@myclassroom.com',
            isTeacher: true,
            rawPassword: 'requestPassReset',
            confirmedPassword: 'requestPassReset'
        })
    })

    it('should respond with 204 and initiate password reset request', async () => {
        const resp = await request(app).put('/users/password').send({
            email: 'requestpassreset@myclassroom.com'
        })
        expect(resp.statusCode).toEqual(200)
        expect(resp.body.message).toEqual(`If an account exists for ${user.email}, password reset instructions will be sent`)
        await user.reload()
        expect(user.passwordResetInitiated).toEqual(true)
        expect(user.passwordResetCode).toBeTruthy()
        expect(user.passwordResetExpiresAt).toBeTruthy()
    })

    it('should respond with 204 and not initiate reset for non-existent email', async () => {
        const resp = await request(app).put('/users/password').send({
            email: 'thisemaildoesntexist@myclassroom.com'
        })
        expect(resp.statusCode).toEqual(200)
        expect(resp.body.message).toEqual(`If an account exists for thisemaildoesntexist@myclassroom.com, password reset instructions will be sent`)
    })

    it('should respond with 400 and missing fields', async () => {
        const resp = await request(app).put('/users/password').send({
            garbage: 'lmao'
        })
        expect(resp.statusCode).toEqual(400)
        expect(resp.body.error).toEqual('Missing fields required for password reset request: email')
    })

    afterAll(async () => {
        await user.destroy()
    })
})

describe('/users/:userId', () => {

    let user
    let admin
    let userCookies
    let adminCookies
    let userXsrfCookie
    let adminXsrfCookie

    beforeAll(async () => {
        user = await db.User.create({
            firstName: 'regular',
            lastName: 'user',
            email: 'regularuser@myclassroom.com',
            rawPassword: 'regularuserpass!',
            confirmedPassword: 'regularuserpassword!',
            emailConfirmed: true
        })

        admin = await db.User.create({
            firstName: 'admin',
            lastName: 'user',
            email: 'adminuser@myclassroom.com',
            rawPassword: 'adminuserpass!',
            confirmedPassword: 'adminuserpassword!',
            admin: true,
            emailConfirmed: true
        })

        userJwt = jwtUtils.encode({
            sub: user.id
        })
        adminJwt = jwtUtils.encode({
            sub: admin.id
        })

        const userSession = await generateUserSession(user)
        const adminSession = await generateUserSession(admin)
        
        userCookies = [`_myclassroom_session=${userJwt}`, `xsrf-token=${userSession.csrfToken}`]
        adminCookies = [`_myclassroom_session=${adminJwt}`, `xsrf-token=${adminSession.csrfToken}`]
    })

    describe('GET', () => {
        it ('should return 200 and user information for that user', async () => {
            const resp = await request(app).get(`/users/${user.id}`).set('Cookie', userCookies).send()
            expect(resp.statusCode).toEqual(200)
            expect(resp.body.user.firstName).toEqual('regular')
            expect(resp.body.user.lastName).toEqual('user')
            expect(resp.body.user.email).toEqual('regularuser@myclassroom.com')
        })

        it ('should return 200 and user information for admin user', async () => {
            const resp = await request(app).get(`/users/${user.id}`).set('Cookie', adminCookies).send()
            expect(resp.statusCode).toEqual(200)
            expect(resp.body.user.firstName).toEqual('regular')
            expect(resp.body.user.lastName).toEqual('user')
            expect(resp.body.user.email).toEqual('regularuser@myclassroom.com')
        })

        it ('should return 403 and insufficient permissions', async () => {
            const resp = await request(app).get(`/users/${admin.id}`).set('Cookie', userCookies).send()
            expect(resp.statusCode).toEqual(403)
            expect(resp.body.error).toEqual(`Insufficient permissions to access that resource`)
        })

        it ('should return 404 and user not found', async () => {
            const fakeId = 123123132
            const resp = await request(app).get(`/users/${fakeId}`).set('Cookie', userCookies).send()
            expect(resp.statusCode).toEqual(404)
            expect(resp.body.error).toEqual(`User with id ${fakeId} not found`)
        })
    })

    describe('PUT', () => {
        it('should respond with 404 and user not found', async () => {
            const fakeId = 123123132
            const resp = await request(app).put(`/users/${fakeId}`).set('Cookie', userCookies).send({
                firstName: 'faker'
            })
            expect(resp.statusCode).toEqual(404)
            expect(resp.body.error).toEqual(`User with id ${fakeId} not found`)
        })

        it('should respond with 403 and insufficient permissions', async () => {
            const resp = await request(app).put(`/users/${user.id}`).set('Cookie', adminCookies).send({
                firstName: 'admintakeover'
            })
            expect(resp.statusCode).toEqual(403)
            expect(resp.body.error).toEqual(`Insufficient permissions to access that resource`)
        })

        it('should respond with 400 and no fields', async () => {
            const resp = await request(app).put(`/users/${user.id}`).set('Cookie', userCookies).send({})
            expect(resp.statusCode).toEqual(400)
            expect(resp.body.error).toEqual(`Missing any valid fields to update the user: email, firstName, lastName`)
        })

        it('should respond with 400 and not empty violation for firstName', async () => {
            const resp = await request(app).put(`/users/${user.id}`).set('Cookie', userCookies).send({
                firstName: ""
            })
            expect(resp.statusCode).toEqual(400)
            expect(resp.body.error).toContain(`First name cannot be empty`)
        })

        it('should respond with 200 and updated information', async () => {
            const resp = await request(app).put(`/users/${user.id}`).set('Cookie', userCookies).send({
                firstName: 'updated',
                lastName: 'irregular',
                email: 'irregularuser@myclassroom.com'
            })
            expect(resp.statusCode).toEqual(200)
            expect(resp.body.user.firstName).toEqual('updated')
            expect(resp.body.user.lastName).toEqual('irregular')
            expect(resp.body.user.email).toEqual('irregularuser@myclassroom.com')
            await user.reload()
            expect(user.emailConfirmed).toEqual(false)
            expect(user.firstName).toEqual('updated')
            expect(user.lastName).toEqual('irregular')
            expect(user.email).toEqual('irregularuser@myclassroom.com')
        })

        it('should respond with 400 and missing fields for password change', async () => {
            const resp = await request(app).put(`/users/${user.id}`).set('Cookie', userCookies).send({
                firstName: 'updated',
                lastName: 'irregular',
                email: 'irregularuser@myclassroom.com',
                oldPassword: 'regularuserpass!',
                isTeacher: true,
                rawPassword: 'irregularuserpass!'
            })
            expect(resp.statusCode).toEqual(400)
            expect(resp.body.error).toEqual(`Missing fields required to update password: confirmedPassword`)
        })

        it('should respond with 401 and incorrect password', async () => {
            const resp = await request(app).put(`/users/${user.id}`).set('Cookie', userCookies).send({
                firstName: 'updated',
                lastName: 'irregular',
                email: 'irregularuser@myclassroom.com',
                oldPassword: 'regularuserpass',
                isTeacher: true,
                rawPassword: 'irregularuserpass!',
                confirmedPassword: 'irregularuserpass!'
            })
            expect(resp.statusCode).toEqual(401)
            expect(resp.body.error).toEqual(`Incorrect password. Cannot set new password.`)
        })

        it('should respond with 400 and password mismatch', async () => {
            const resp = await request(app).put(`/users/${user.id}`).set('Cookie', userCookies).send({
                firstName: 'updated',
                lastName: 'irregular',
                email: 'irregularuser@myclassroom.com',
                oldPassword: 'regularuserpass!',
                isTeacher: true,
                rawPassword: 'irregularuserpass!',
                confirmedPassword: 'irregularuserpass'
            })
            expect(resp.statusCode).toEqual(400)
            expect(resp.body.error).toEqual(`Passwords do not match`)
        })

        it('should respond with 200 and updated information and password changed', async () => {
            const resp = await request(app).put(`/users/${user.id}`).set('Cookie', userCookies).send({
                firstName: 'updater',
                lastName: 'irregulars',
                email: 'irregularsuser@myclassroom.com',
                oldPassword: 'regularuserpass!',
                rawPassword: 'irregularuserpass!',
                isTeacher: true,
                confirmedPassword: 'irregularuserpass!'
            })
            expect(resp.statusCode).toEqual(200)
            expect(resp.body.user.firstName).toEqual('updater')
            expect(resp.body.user.lastName).toEqual('irregulars')
            expect(resp.body.user.email).toEqual('irregularsuser@myclassroom.com')
            await user.reload()
            expect(user.emailConfirmed).toEqual(false)
            expect(user.firstName).toEqual('updater')
            expect(user.lastName).toEqual('irregulars')
            expect(user.email).toEqual('irregularsuser@myclassroom.com')
            expect(user.validatePassword('irregularuserpass!')).toEqual(true)
        })
    })

    describe('PUT /confirm', () => {

        let user
        let admin
        let userCookies
        let userXsrfCookie

        beforeAll(async () => {
            user = await db.User.create({
                firstName: 'regular',
                lastName: 'user',
                email: 'regularuser2@myclassroom.com',
                rawPassword: 'regularuserpass!',
                confirmedPassword: 'regularuserpassword!'
            })
    
            admin = await db.User.create({
                firstName: 'admin',
                lastName: 'user',
                email: 'adminuser2@myclassroom.com',
                rawPassword: 'adminuserpass!',
                isTeacher: true,
                confirmedPassword: 'adminuserpassword!',
                admin: true
            })
    
            userJwt = jwtUtils.encode({
                sub: user.id
            })
            
            const userSession = await generateUserSession(user)
            userCookies = [`_myclassroom_session=${userJwt}`, `xsrf-token=${userSession.csrfToken}`]
        })

        it('should respond with 404 and user not found', async () => {
            const resp = await request(app).put(`/users/${12345}/confirm`).set('Cookie', userCookies).send({
                emailConfirmationCode: '123456'
            })
            
            expect(resp.statusCode).toEqual(404)
            expect(resp.body.error).toEqual(`User with id 12345 not found`)
        })

        it('should respond with 403 and insufficient permissions', async () => {
            const resp = await request(app).put(`/users/${admin.id}/confirm`).set('Cookie', userCookies).send({
                emailConfirmationCode: '123456'
            })
            expect(resp.statusCode).toEqual(403)
            expect(resp.body.error).toEqual(`Insufficient permissions to access that resource`)
        })

        it('should respond with 400 and emailConfirmationCode required', async () => {
            const resp = await request(app).put(`/users/${user.id}/confirm`).set('Cookie', userCookies).send({
                garbage: 1
            })
            expect(resp.statusCode).toEqual(400)
            expect(resp.body.error).toEqual(`emailConfirmationCode required`)
        })

        it ('should respond with 401 and emailConfirmationCode incorrect', async () => {
            const resp = await request(app).put(`/users/${user.id}/confirm`).set('Cookie', userCookies).send({
                emailConfirmationCode: '123456'
            })
            expect(resp.statusCode).toEqual(401)
            expect(resp.body.error).toEqual(`emailConfirmationCode incorrect`)
        })

        it('should respond with 498 and emailConfirmationCode expired and new email send', async () => {
            await user.update({emailConfirmationExpiresAt: moment().utc()})
            expect(user.emailConfirmationExpired()).toEqual(true)
            const resp = await request(app).put(`/users/${user.id}/confirm`).set('Cookie', userCookies).send({
                emailConfirmationCode: user.emailConfirmationCode
            })
            expect(resp.statusCode).toEqual(498)
            expect(resp.body.error).toEqual(`emailConfirmationCode expired. A new code should have been emailed.`)
            await user.reload()
            expect(user.emailConfirmationExpired()).toEqual(false)
        })

        it('should respond with 200', async () => {
            const resp = await request(app).put(`/users/${user.id}/confirm`).set('Cookie', userCookies).send({
                emailConfirmationCode: user.emailConfirmationCode
            })
            expect(resp.statusCode).toEqual(200)
            await user.reload()
            expect(user.emailConfirmed).toEqual(true)
        })

        it('should respond with 409 and email already confirmed', async () => {
            const resp = await request(app).put(`/users/${user.id}/confirm`).set('Cookie', userCookies).send({
                emailConfirmationCode: user.emailConfirmationCode
            })
            expect(resp.statusCode).toEqual(409)
            expect(resp.body.error).toEqual(`email already confirmed`)
        })
    })

    describe('GET /confirm', () => {

        let user
        let admin
        let userCookies
        let userXsrfCookie

        beforeAll(async () => {
            user = await db.User.create({
                firstName: 'regular',
                lastName: 'user',
                email: 'regularuser3@myclassroom.com',
                rawPassword: 'regularuserpass!',
                isTeacher: true,
                confirmedPassword: 'regularuserpassword!'
            })
    
            admin = await db.User.create({
                firstName: 'admin',
                lastName: 'user',
                email: 'adminuser3@myclassroom.com',
                rawPassword: 'adminuserpass!',
                isTeacher: true,
                confirmedPassword: 'adminuserpassword!',
                admin: true
            })
    
            userJwt = jwtUtils.encode({
                sub: user.id
            })

            const userSession = await generateUserSession(user)
            userCookies = [`_myclassroom_session=${userJwt}`, `xsrf-token=${userSession.csrfToken}`]
        })

        it('should respond with 404 and user not found', async () => {
            const resp = await request(app).get(`/users/${12345}/confirm`).set('Cookie', userCookies).send()
            expect(resp.statusCode).toEqual(404)
            expect(resp.body.error).toEqual(`User with id 12345 not found`)
        })

        it('should respond with 403 and insufficient permissions', async () => {
            const resp = await request(app).get(`/users/${admin.id}/confirm`).set('Cookie', userCookies).send()
            expect(resp.statusCode).toEqual(403)
            expect(resp.body.error).toEqual(`Insufficient permissions to access that resource`)
        })

        it('should respond with 200', async () => {
            const emailConfirmationCode = user.emailConfirmationCode
            const resp = await request(app).get(`/users/${user.id}/confirm`).set('Cookie', userCookies).send()
            expect(resp.statusCode).toEqual(200)
            await user.reload()
            expect(user.emailConfirmationCode).not.toEqual(emailConfirmationCode)
        })

        it('should respond with 400 and email already confirmed', async () => {
            await user.update({emailConfirmed: true})
            const resp = await request(app).get(`/users/${user.id}/confirm`).set('Cookie', userCookies).send()
            expect(resp.statusCode).toEqual(400)
            expect(resp.body.error).toEqual(`email already confirmed`)
        })
    })

    describe('DELETE', () => {

        let user
        let admin
        let userXsrfCookie
        let adminXsrfCookie
        let userCookies
        let adminCookies

        beforeAll(async () => {
            user = await db.User.create({
                firstName: 'regular',
                lastName: 'user',
                email: 'regularuser4@myclassroom.com',
                rawPassword: 'regularuserpass!',
                isTeacher: true,
                confirmedPassword: 'regularuserpassword!'
            })
    
            admin = await db.User.create({
                firstName: 'admin',
                lastName: 'user',
                email: 'adminuser4@myclassroom.com',
                rawPassword: 'adminuserpass!',
                isTeacher: true,
                confirmedPassword: 'adminuserpassword!',
                admin: true
            })
    
            userJwt = jwtUtils.encode({
                sub: user.id
            })
            adminJwt = jwtUtils.encode({
                sub: admin.id
            })

            const userSession = await generateUserSession(user)
            const adminSession = await generateUserSession(admin)
            
            userCookies = [`_myclassroom_session=${userJwt}`, `xsrf-token=${userSession.csrfToken}`]
            adminCookies = [`_myclassroom_session=${adminJwt}`, `xsrf-token=${adminSession.csrfToken}`]
        })

        it('should respond with 404 and user not found', async () => {
            const fakeId = 123123132
            const resp = await request(app).delete(`/users/${fakeId}`).set('Cookie', userCookies).send()
            expect(resp.statusCode).toEqual(404)
            expect(resp.body.error).toEqual(`User with id ${fakeId} not found`)
        })

        it('should respond with 403 and insufficient permissions', async () => {
            const resp = await request(app).delete(`/users/${admin.id}`).set('Cookie', userCookies).send()
            expect(resp.statusCode).toEqual(403)
            expect(resp.body.error).toEqual(`Insufficient permissions to access that resource`)
        })

        it ('should respond with 204 and admin deleted', async () => {
            const resp = await request(app).delete(`/users/${admin.id}`).set('Cookie', adminCookies).send()
            expect(resp.statusCode).toEqual(204)
        })

        it ('should respond with 204 and user deleted', async () => {
            const resp = await request(app).delete(`/users/${user.id}`).set('Cookie', userCookies).send()
            expect(resp.statusCode).toEqual(204)
        })        
    })

    afterAll(async () => {
        await user.destroy()
        await admin.destroy()
    })
})
