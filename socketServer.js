// const { Server } = require("socket.io");
// const mongoose = require("mongoose");
// const User = require("./models/UserModel");
// const Conversation = require("./models/MessageModel");

// const userSockets = {};

// const socketServer = (server) => {
//   const io = new Server(server, {
//     cors: {
//       origin: "*", // Adjust this to your client's URL if needed
//       methods: ["GET", "POST"],
//     },
//   });

//   io.on("connection", (socket) => {
//     const userId = socket.handshake.query.userId;
//     if (!userId) {
//       console.error("User ID is required for connection");
//       socket.disconnect();
//       return;
//     }

//     userSockets[userId] = socket.id;
//     console.log(`User connected: ${userId}`);
//     console.log("Current userSockets:", userSockets);

//     // Handle private messages
//     socket.on("private message", async ({ from, to, message }) => {
//       console.log(`Private message from ${from} to ${to}: ${message}`);

//       // Emit the message to the recipient
//       const recipientSocketId = userSockets[to];
//       if (recipientSocketId) {
//         io.to(recipientSocketId).emit("private message", {
//           from,
//           message,
//         });
//       } else {
//         console.warn(`Recipient socket ID not found for user: ${to}`);
//       }

//       // Save the message to the appropriate conversation in MongoDB
//       try {
//         let conversation = await Conversation.findOne({
//           participants: {
//             $all: [
//               new mongoose.Types.ObjectId(from),
//               new mongoose.Types.ObjectId(to),
//             ],
//           },
//         });

//         if (!conversation) {
//           conversation = new Conversation({
//             participants: [
//               new mongoose.Types.ObjectId(from),
//               new mongoose.Types.ObjectId(to),
//             ],
//             messages: [],
//           });
//           await conversation.save();

//           // Add the conversation reference to both users
//           await User.findByIdAndUpdate(from, {
//             $push: { conversations: conversation._id },
//           });
//           await User.findByIdAndUpdate(to, {
//             $push: { conversations: conversation._id },
//           });
//         }

//         const newMessage = {
//           from: new mongoose.Types.ObjectId(from),
//           message,
//         };
//         conversation.messages.push(newMessage);
//         await conversation.save();
//         console.log(`Message saved to conversation ${conversation._id}`);

//         // Emit the newMessage event to both participants
//         io.to(userSockets[from]).emit("newMessage", {
//           conversationId: conversation._id,
//           ...newMessage,
//         });
//         if (recipientSocketId) {
//           io.to(recipientSocketId).emit("newMessage", {
//             conversationId: conversation._id,
//             ...newMessage,
//           });
//         }
//       } catch (error) {
//         console.error("Error saving message to MongoDB:", error);
//       }
//     });

//     socket.on("disconnect", (reason) => {
//       console.log(`User disconnected: ${reason}`);
//       delete userSockets[userId];
//       console.log("Current userSockets after disconnect:", userSockets);
//     });
//   });
// };

// module.exports = socketServer;
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const User = require("./models/UserModel");
const Conversation = require("./models/MessageModel");

const userSockets = {};
const messageQueue = {};

const processMessageQueue = async (userId, io) => {
  if (!messageQueue[userId] || messageQueue[userId].length === 0) return;

  const messages = messageQueue[userId];
  messageQueue[userId] = [];

  try {
    for (const { from, to, message } of messages) {
      let conversation = await Conversation.findOne({
        participants: {
          $all: [
            new mongoose.Types.ObjectId(from),
            new mongoose.Types.ObjectId(to),
          ],
        },
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [
            new mongoose.Types.ObjectId(from),
            new mongoose.Types.ObjectId(to),
          ],
          messages: [],
        });
        await conversation.save();

        await User.findByIdAndUpdate(from, {
          $push: { conversations: conversation._id },
        });
        await User.findByIdAndUpdate(to, {
          $push: { conversations: conversation._id },
        });
      }

      const newMessage = {
        from: new mongoose.Types.ObjectId(from),
        message,
      };
      conversation.messages.push(newMessage);
      await conversation.save();
      console.log(`Message saved to conversation ${conversation._id}`);

      const recipientSocketId = userSockets[to];
      io.to(userSockets[from]).emit("newMessage", {
        conversationId: conversation._id,
        ...newMessage,
      });
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("newMessage", {
          conversationId: conversation._id,
          ...newMessage,
        });
      }
    }
  } catch (error) {
    console.error("Error saving message to MongoDB:", error);
  }
};

const socketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
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

    socket.on("private message", ({ from, to, message }) => {
      console.log(`Private message from ${from} to ${to}: ${message}`);

      if (!messageQueue[from]) {
        messageQueue[from] = [];
      }
      messageQueue[from].push({ from, to, message });

      const recipientSocketId = userSockets[to];
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("private message", {
          from,
          message,
        });
      } else {
        console.warn(`Recipient socket ID not found for user: ${to}`);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${reason}`);
      processMessageQueue(userId, io); // Pass io here
      delete userSockets[userId];
      console.log("Current userSockets after disconnect:", userSockets);
    });
  });
};

module.exports = socketServer;
