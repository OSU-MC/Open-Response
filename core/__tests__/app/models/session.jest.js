const db = require('../../../app/models/index')
const moment = require('moment')

describe("Session model", () => {
    let session
    let user

    beforeAll(async() => {
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
        it ("Should create a valid session record with default time in expires (Now + 4 hours)", async () => {
            expect(moment(session.expires).isValid()).toEqual(true) 
        })

        it ("Should return false, as we just made the session", async() => {
            expect(session.checkIfExpired()).toEqual(false) 
        })

        it ("Should return true, as the session expired", async() =>{
            await session.update({expires: moment().subtract(1, 'minutes')})
            expect(session.checkIfExpired()).toEqual(true) 
        })
    })
    

    afterAll(async () => {
        await user.destroy()
    })
})