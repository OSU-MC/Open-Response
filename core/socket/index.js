const { Server } = require("socket.io");

module.exports = function (server) {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        socket.on("setLiveQuestion", ({ lectureId }) => {
            io.to(`lecture-${lectureId}`).emit("questionUpdated");
        });

        socket.on("joinLecture", ({ lectureId }) => {
            socket.join(`lecture-${lectureId}`);
        });
    });

    return io;
};