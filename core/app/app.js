const cors = require("cors");
var express = require("express");
const cookieParser = require("cookie-parser");
const { logger, morganMiddleware } = require("../lib/logger");

if (process.env.NODE_ENV == "development") {
	require("dotenv").config({ override: false });
}

var app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(morganMiddleware);
app.use(cookieParser());

// TODO: research and implement better, more secure options
app.use(
	cors({
		origin: process.env.CLIENT_URL,
		methods: ["GET", "PUT", "POST", "DELETE"],
		optionsSuccessStatus: 200,
		credentials: true,
		allowedHeaders: ['Content-Type', 'Authorization'],
	})
);

/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use("/", require("./api"));

app.use("*", function (req, res, next) {
	res.status(404).send({
		error: "The requested resource does not exist",
	});
});

// this is our global exception handler function. If an error is thrown and caught, use the next() function with the error to pass it down to here
app.use(function (err, req, res, next) {
	logger.error(err);
	res.status(500).send({
		error:
			"Something unexpected happened. Please try again or contact the admin",
	});
});

module.exports = app;
