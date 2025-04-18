const env = process.env.NODE_ENV || "development";
if (env === "development" || env === "test") {
	// dotenv file will only be used in dev and testing
	require("dotenv").config({ override: false }); // will not override current environment variables if they exist
}

module.exports = {
	development: {
		username: process.env.DEV_DB_USER || "dev_admin",
		password: process.env.DEV_DB_PASS || "password",
		database: process.env.DEV_DB_NAME || "myclassroom_development",
		host: process.env.DEV_DB_HOST || "127.0.0.1",
		port: process.env.DEV_DB_PORT || 3306,
		dialect: "mysql",
	},
	test: {
		username: process.env.TEST_DB_USER || "test_admin",
		password: process.env.TEST_DB_PASS || "password",
		database: process.env.TEST_DB_NAME || "myclassroom_test",
		host: process.env.TEST_DB_HOST || "127.0.0.1",
		port: process.env.TEST_DB_PORT || 3306,
		dialect: "mysql",
	},
	production: {
		username: process.env.RDS_USERNAME,
		password: process.env.RDS_PASSWORD,
		database: process.env.RDS_DB_NAME,
		host: process.env.RDS_HOSTNAME,
		dialect: "mysql",
		ssl: "Amazon RDS",
		port: process.env.RDS_PORT || 3306,
	},
};
