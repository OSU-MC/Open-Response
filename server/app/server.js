const db = require("./models");
const port = process.env.PORT || 3001;
const app = require("./app");
const { logger } = require("../lib/logger");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
	cors: {
		origin: "http://localhost:3000",  // Deployment Note: fix URL to match deploment 
		methods: ["GET", "POST"],
		credentials: true
	}
});

io.on('connection', (socket) => {
    socket.on('setLiveQuestion', ({ lectureId }) => {
        // Notify all clients in this lecture to refresh their questions
        io.to(`lecture-${lectureId}`).emit('questionUpdated');
    });

    socket.on("joinLecture", ({ lectureId }) => {
        socket.join(`lecture-${lectureId}`);
    });
});
db.sequelize
	.authenticate()
	.then(function () {
		//sync will automatically create the table, but it will never alter a table (migrations must be run for alterations)
		server.listen(port, () => {
			logger.info(`Server is listening on port: ${port}`);
		});
	})
	.catch((error) => {
		logger.error(`Unable to connect to sequelize database`);
		logger.error(error);
	});
