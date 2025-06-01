const { extractValidFields, validateAgainstSchema } = require('../../lib/validator')
const moment = require('moment')

const userInformationSchema = {
    id: { required: false },
    firstName: { required: true },
    lastName: { required: true },
    email: { required: true },
    isTeacher: {required: true},
}

const userCreationSchema = {
    ...userInformationSchema,
    rawPassword: { required: true },
}

const userCreationRequestSchema = {
    ...userCreationSchema,
    confirmedPassword: { required: true }
}

const userLoginRequestSchema = {
    email: { required: true },
    rawPassword: { required: true }
}

const userPasswordChangeRequestSchema = {
    oldPassword: { required: true },
    rawPassword: { required: true },
    confirmedPassword: { required: true }
}

const userPasswordResetRequestSchema = {
    email: { required: true },
    passwordResetCode: { required: true },
    rawPassword: { required: true },
    confirmedPassword: { required: true }
}

exports.validateUserCreationRequest = (body) => {
    return validateAgainstSchema(body, userCreationRequestSchema)
}

exports.extractUserCreationFields = (body) => {
    return extractValidFields(body, userCreationSchema)
}

exports.filterUserFields = (body) => {
    return extractValidFields(body, userInformationSchema)
}

exports.validateUserLoginRequest = (body) => {
    return validateAgainstSchema(body, userLoginRequestSchema)
}

exports.validateUserPasswordChangeRequest = (body) => {
    return validateAgainstSchema(body, userPasswordChangeRequestSchema)
}

exports.validateUserPasswordResetRequest = (body) => {
    return validateAgainstSchema(body, userPasswordResetRequestSchema)
}


/*

Different integers are associated with different statuses of logging in the user

0: success
-1: invalid password
-2: invalid password. Password reset because 3rd failure in a row
-3: account is locked from too many login failures
1: waiting on a password reset - no login failures. User can still login here but track this status for frontend
2: waiting on email confirmation. User can still login here but track this status for frontend 

*/
exports.login = (user, password) => {
    if (user.failedLoginAttempts < 3){
        if (user.validatePassword(password)) {
            user.lastLogin = moment().utc().format("YYYY-MM-DD HH:mm:ss")
            user.failedLoginAttempts = 0
            if (user.emailConfirmed) {
                if (user.passwordResetInitiated) {
                    return 1
                }
                else {
                    return 0
                }
            }
            else {
                return 2
            }
        }
        else {
            user.failedLoginAttempts = user.failedLoginAttempts + 1
            if (user.failedLoginAttempts == 3) {
                user.generatePasswordReset()
                return -2
            }
            else {
                return -1
            }
        }
    }
    else {
        return -3
    }
}

const getLoggedInStatus = (user) => {
    if (user.emailConfirmed) {
        if (user.passwordResetInitiated) {
            return "A password reset has been initiated for this account, but the password has not been reset"
        }
        else {
            return ""
        }
    }
    else {
        return "This account email has not been confirmed. You cannot recover your account in the case of a lost password unless you confirm your email."
    }
}

exports.getLoggedInStatus = getLoggedInStatus