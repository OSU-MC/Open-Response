const db = require("./models");
const port = process.env.PORT || 3001;
const app = require("./app");
const { logger } = require("../lib/logger");
const http = require("http");
const server = http.createServer(app);
require("../socket")(server);

db.sequelize
	.authenticate()
	.then(function () {
		//sync will automatically create the table, but it will never alter a table (migrations must be run for alterations)
		app.listen(port, "0.0.0.0", function () {
			logger.info(`Core is listening on port: ${port}`);
		});
	})
	.catch((error) => {
		logger.error(`Unable to connect to sequelize database`);
		logger.error(error);
	});
