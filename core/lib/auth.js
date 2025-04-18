// Import necessary modules using CommonJS syntax
const jwtUtils = require('./jwt_utils'); // For JWT token operations
const { serialize } = require('cookie'); // For serializing cookies
const db = require('../app/models'); // Access to the database models
const { logger } = require('./logger'); // Logging utility
const moment = require('moment'); // Date manipulation library
const string_helpers = require('./string_helpers')
const { ValidationError } = require('sequelize'); // Sequelize error handling

/**
 * Generates a JWT token for a user
 * @param {Object} user - The user object for which to generate the token
 * @returns {String} - The generated JWT token
 */
const generateUserAuthToken = (user) => {
    const payload = { sub: user.id }; // Payload with user ID
    // TODO: incorporate account locking and other user-model information checking in this method (email confirmation, failed login attempts, etc)
    return jwtUtils.encode(payload); // Encode payload into JWT token
};

/**
 * Sets the authentication cookie in the user's browser
 * @param {Object} res - The response object to set cookie headers on
 * @param {Object} user - The user object to create a session for
 */
const setUserAuthCookie = async (res, user) => {
    const userSession = await generateUserSession(user); // Generate new user session
    const expiry = new Date(Date.now() + 1000 * 60 * 60 * 12); // Expire cookie in 12hrs
    
    // Set two cookies: one for the session token and another for the CSRF token
    res.setHeader("Set-Cookie", [
        serialize("_myclassroom_session", generateUserAuthToken(user), {
            path: "/",
            httpOnly: true, // Cookie is HTTP only for security
            expires: expiry // Set expiry for cookie
        }),
        serialize("xsrf-token", userSession.csrfToken, {
            path: "/",
            expires: expiry // Set expiry for CSRF token
        })
    ]);
};

/**
 * Removes the authentication cookie from the user's browser
 * @param {Object} req - The request object to read cookies from
 * @param {Object} res - The response object to set cookie headers on
 */
const removeUserAuthCookie = async (req, res) => {
    // Update session to expire immediately
    await db.Session.update({ expires: moment().utc()}, { where: { csrfToken: req.cookies["xsrf-token"]}});
    
    // Clear both cookies by setting them to empty strings
    res.setHeader("Set-Cookie", [
        serialize("_myclassroom_session", "", { path: "/", httpOnly: true }),
        serialize("xsrf-token", "", { path: "/" })
    ]);
};

/**
 * Middleware to require authentication for a route
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function in the stack
 */
const requireAuthentication = async (req, res, next) => {
    // Extract session/CSRF token from cookies
    const token = req.cookies["_myclassroom_session"] || req.headers["_myclassroom_session"]; // Prefer cookie over header
    const csrfToken = req.cookies["xsrf-token"] || req.headers["xsrf-token"]; // Prefer cookie over header
    
    try {
        const payload = jwtUtils.decode(token); // Decode JWT token to get payload
        const session = await validateCsrfToken(csrfToken, payload.sub); // Validate CSRF token
        req.payload = payload; // Attach payload to request object
        await session.update({ expires: moment().add(4, 'H').utc() }); // Update session expiry
        next(); // Proceed to next middleware
    } catch (err) {
        logger.error(err);
        // Respond with a 401 Unauthorized status if authentication fails
        res.status(401).send({ error: "Invalid authentication token" });
    }
};

/**
 * Validates the CSRF token
 * @param {String} token - The CSRF token to validate
 * @param {Number} userId - The user ID to validate the token against
 * @returns {Object} - The session object if validation is successful
 */
const validateCsrfToken = async (token, userId) => {
    // Get session from XSRF token and userId
    const session = await db.Session.findOne({ where: { csrfToken: token, userId: userId } });
    
    // If session does not exist, fail token
    if (!session)
        throw new Error("Invalid CSRF token or session.");
    
    // If session expired, fail token
    if (session.checkIfExpired())
        throw new Error("Session expired.");
    
    // Otherwise return valid session
    return session;
};

/**
 * Generates a new session for a user
 * @param {Object} user - The user object to create a session for
 * @returns {Object} - The created session object
 */
const generateUserSession = async (user) => {
    try {
        // TODO: expire the most recent one
        await db.Session.update({ expires: moment().utc() }, { where: { userId: user.id } });
        
        // Create/return a new session for the user
        return await db.Session.create({ userId: user.id });
    } catch (e) {
        logger.error(`user session creation unexpectedly failed for user: ${user.id}`);
        
        // Handle specific Sequelize validation errors
        if (e instanceof ValidationError) {
            logger.error(string_helpers.serializeSequelizeErrors(e));
            throw new Error("Unable to create user session");
        }
        
        logger.error(e);
        throw new Error("Unable to create user session");
    }
};

// Exporting functions to be used elsewhere in the application
module.exports = { setUserAuthCookie, removeUserAuthCookie, requireAuthentication, generateUserSession };
