const db = require('../../../app/models/index')
const moment = require('moment')

describe("Session model", () => {
    let session
    let user

    beforeAll(async () => {
        user = await db.User.create({
            email: "session@myclassroom.com",
            rawPassword: "passwordmystery!!!",
            firstName: "Memer",
            lastName: "McMemerson"
        })
        session = await db.Session.create({
            userId: user.id
        })
    })

    describe("Session.create", () => {
        it("Should create a valid session record with default expiration time (Now + 4 hours)", async () => {
            expect(moment(session.expires).isValid()).toEqual(true)
            expect(session.softDelete).toBeFalsy() // Ensure soft delete defaults to false
        })

        it("Should return false, as we just made the session", async () => {
            expect(session.checkIfExpired()).toEqual(false)
        })

        it("Should return true, as the session expired", async () => {
            await session.update({ expires: moment().subtract(1, 'minutes') })
            expect(session.checkIfExpired()).toEqual(true)
        })

        it("Should soft delete a session", async () => {
            await session.update({ softDelete: true })
            await expect(session.save()).resolves.toBeTruthy()
            await session.reload()
            expect(session.softDelete).toBeTruthy()
        })
    })

    afterAll(async () => {
        await session.destroy()
        await user.destroy()
    })
})
