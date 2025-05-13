const http = require("http");
const { Server } = require("socket.io");
const express = require("express");

const app = express();

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);
    res.status(500).send("Something went wrong!");
});


const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: [process.env.CLIENT_URL || "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
    }
});


io.on("connection", (socket) => {
    socket.on("setLiveQuestion", ({ lectureId }) => {
        console.log(`Received setLiveQuestion for lectureId: ${lectureId}`);
        io.to(`lecture-${lectureId}`).emit("questionUpdated");
    });

    socket.on("joinLecture", ({ lectureId }) => {
        console.log(`User joined lecture-${lectureId}`);
        socket.join(`lecture-${lectureId}`);
    });
});

const port = process.env.SOCKET_PORT || 3002;
server.listen(port, () => {
    console.log(`Socket server listening on port ${port}`);
});