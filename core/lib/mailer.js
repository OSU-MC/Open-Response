const { CourierClient } = require("@trycourier/courier");
const { logger } = require("./logger");

let courier
const applicationName = process.env.APP_NAME || 'MyClassroom'
const email_enabled = process.env.ENABLE_EMAIL === 'true'
if (email_enabled) {
  courier = CourierClient() // creates the client and uses the COURIER_AUTH_TOKEN env variable as authorization
}

// welcome email sent to the user 
async function welcome(user) {
  if (email_enabled) {
    const { requestId } = await courier.send({
      message: {
        to: {
          data: {
            name: user.firstName,
            application: applicationName
          },
          email: user.email,
        },
        content: {
          title: "Welcome to {{application}}, {{name}}!",
          body: "Your account has successfully been created. You should expect to receive an email confirmation message shortly, which is required to activate your account",
        },
        routing: {
          method: "single",
          channels: ["email"],
        },
      },
    });
    return requestId
  }
  else {
    logger.debug(`Welcome email skipped send to ${user.firstName} ${user.lastName}`)
    return
  }
}

async function confirmation(user) {
  if (email_enabled) {
    const { requestId } = await courier.send({
      message: {
        to: {
          data: {
            code: user.emailConfirmationCode,
            application: applicationName
          },
          email: user.email,
        },
        content: {
          title: "{{application}}: Account Confirmation",
          body: "Your email confirmation code is {{code}}",
        },
        routing: {
          method: "single",
          channels: ["email"],
        },
      },
    });
    return requestId
  }
  else {
    logger.debug(`Confirmation email skipped send to ${user.firstName} ${user.lastName}, confirmationCode: ${user.emailConfirmationCode}`)
    return
  }
}

async function passwordReset(user) {
  if (email_enabled) {
    const { requestId } = await courier.send({
      message: {
        to: {
          data: {
            code: user.passwordResetCode,
            application: applicationName
          },
          email: user.email,
        },
        content: {
          title: "{{application}}: Password Reset",
          body: "Your password reset code is {{code}}",
        },
        routing: {
          method: "single",
          channels: ["email"],
        },
      },
    });
    return requestId
  }
  else {
    logger.debug(`Password reset email skipped send to ${user.firstName} ${user.lastName}, resetCode: ${user.passwordResetCode}`)
    return
  }
}

module.exports.welcome = welcome
module.exports.confirmation = confirmation
module.exports.passwordReset = passwordReset
