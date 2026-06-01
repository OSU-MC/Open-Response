const http = require("http");
const { Server } = require("socket.io");
const express = require("express");

/*As of now, this express app does nothing, and these middleware functions using app
  below do nothing too.
*/
// Initialize the Express application (used here primarily for middleware)
const app = express();

// This logs the timestamp, HTTP method, and URL for every incoming request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// This catches errors passed via next(err) and returns a 500 response
// runs when an error is passed via next() somewhere in th
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).send("Something went wrong!");
});
/*  End of dead code */

/* Actual bare Socket.io server */

// Create a bare HTTP server (Express app is not attached; this server is used solely by Socket.io)
const server = http.createServer();

// Initialize Socket.io on top of the HTTP server with CORS configuration
const io = new Server(server, {
  cors: {
    // Allow connections from the configured client URL, defaulting to localhost:3000
    origin: [process.env.CLIENT_URL || "http://localhost:3000"],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    optionsSuccessStatus: 200,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

/*
  responseStats tracks answer counts per lecture per question.
  Shape: { [lectureId]: { [questionId]: { total: 0, correct: 0 } } }
  This is in-memory only — resets when the socket server restarts.
*/
const responseStats = {};

// Handle incoming Socket.io client connections
io.on("connection", (socket) => {
  // When a client emits "joinLecture", add the socket to the lecture-specific room
  // so it can receive broadcasts targeted at that lecture
  // Teacher or student joins a lecture room
  socket.on("joinLecture", ({ lectureId }) => {
    console.log(`User joined lecture-${lectureId}`);
    socket.join(`lecture-${lectureId}`);
  });

  // When a client emits "setLiveQuestion", broadcast a "questionUpdated" event
  // to all sockets in the corresponding lecture room
  // NEW Teacher makes a question live — broadcast the full question to students
  socket.on("setLiveQuestion", ({ lectureId, question }) => {
    console.log(`Received setLiveQuestion for lectureId: ${lectureId}`);

    if (question) {
      // Initialize stats tracking for this question if not already set
      if (!responseStats[lectureId]) responseStats[lectureId] = {};
      if (!responseStats[lectureId][question.id]) {
        responseStats[lectureId][question.id] = { total: 0, correct: 0 };
      }

      // Send the full question to all students in the room
      io.to(`lecture-${lectureId}`).emit("liveQuestion", { question });
    } else {
      // No question means teacher closed/unpublished — tell students to refresh
      io.to(`lecture-${lectureId}`).emit("liveQuestion", { question: null });
    }

    // Also emit questionUpdated for any legacy listeners
    io.to(`lecture-${lectureId}`).emit("questionUpdated");
  });

  // Student submits an answer — update stats and notify teacher
  socket.on("submitAnswer", ({ lectureId, questionId, isCorrect }) => {
    console.log(
      `Answer submitted for lecture-${lectureId}, question-${questionId}, correct: ${isCorrect}`
    );

    // Initialize if needed
    if (!responseStats[lectureId]) responseStats[lectureId] = {};
    if (!responseStats[lectureId][questionId]) {
      responseStats[lectureId][questionId] = { total: 0, correct: 0 };
    }

    // Update counts
    responseStats[lectureId][questionId].total += 1;
    if (isCorrect) responseStats[lectureId][questionId].correct += 1;

    const stats = responseStats[lectureId][questionId];
    const percentCorrect =
      stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

    // Broadcast updated stats to everyone in the room (teacher will use this)
    io.to(`lecture-${lectureId}`).emit("responseStats", {
      questionId,
      total: stats.total,
      correct: stats.correct,
      percentCorrect,
    });
  });

  // Teacher closes a question — clear its stats
  socket.on("closeQuestion", ({ lectureId, questionId }) => {
    console.log(`Closing question-${questionId} for lecture-${lectureId}`);
    if (responseStats[lectureId]) {
      delete responseStats[lectureId][questionId];
    }
    socket.to(`lecture-${lectureId}`).emit("liveQuestion", { question: null });
  });
});

// Start the server on the configured port, defaulting to 3002
const port = process.env.SOCKET_PORT || 3002;
server.listen(port, () => {
  console.log(`Socket server listening on port ${port}`);
});
