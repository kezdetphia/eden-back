const { Server } = require("socket.io");

const socketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Adjust this to your client's URL if needed
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("chat message", (msg) => {
      console.log(`Received message: ${msg}`);
      io.emit("chat message", msg); // Broadcast message to all connected clients
    });

    socket.on("disconnect", (reason) => {
      console.log(`user disconnected: ${reason}`);
    });
  });
};

module.exports = socketServer;
