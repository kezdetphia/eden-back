const { Server } = require("socket.io");
const mongoose = require("mongoose");
const User = require("./models/UserModel");
const Message = require("./models/MessageModel");

const userSockets = {};

const socketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Adjust this to your client's URL if needed
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (!userId) {
      console.error("User ID is required for connection");
      socket.disconnect();
      return;
    }

    userSockets[userId] = socket.id;
    console.log(`User connected: ${userId}`);
    console.log("Current userSockets:", userSockets);

    // Handle private messages
    socket.on("private message", async ({ from, to, message }) => {
      console.log(`Private message from ${from} to ${to}: ${message}`);

      // Emit the message to the recipient
      const recipientSocketId = userSockets[to];
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("private message", {
          from,
          message,
        });
      } else {
        console.warn(`Recipient socket ID not found for user: ${to}`);
      }

      // Save the message to MongoDB
      try {
        const newMessage = new Message({
          from: new mongoose.Types.ObjectId(from),
          to: new mongoose.Types.ObjectId(to),
          message,
        });
        await newMessage.save();

        // Update the sender and recipient with the new message
        await User.findByIdAndUpdate(from, {
          $push: { messages: newMessage._id },
        });
        await User.findByIdAndUpdate(to, {
          $push: { messages: newMessage._id },
        });
      } catch (error) {
        console.error("Error saving message to MongoDB:", error);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${reason}`);
      delete userSockets[userId];
      console.log("Current userSockets after disconnect:", userSockets);
    });
  });
};

module.exports = socketServer;
// ------This works perfectly
// const { Server } = require("socket.io");

// const socketServer = (server) => {
//   const io = new Server(server, {
//     cors: {
//       origin: "*", // Adjust this to your client's URL if needed
//       methods: ["GET", "POST"],
//     },
//   });

//   io.on("connection", (socket) => {
//     console.log("a user connected");

//     socket.on("chat message", (msg) => {
//       console.log(`Received message: ${msg}`);
//       io.emit("chat message", msg); // Broadcast message to all connected clients
//     });

//     socket.on("disconnect", (reason) => {
//       console.log(`user disconnected: ${reason}`);
//     });
//   });
// };

// module.exports = socketServer;

// ------This works perfectly
