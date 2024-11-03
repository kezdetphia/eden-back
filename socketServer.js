const { Server } = require("socket.io");
const mongoose = require("mongoose");
const User = require("./models/UserModel");
const Conversation = require("./models/ConversationModel");
const Message = require("./models/MessageModel");

const socketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Adjust this as needed for security
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

    // Join the user to a room identified by their userId
    socket.join(userId);
    console.log(`User connected: ${userId}`);

    // Handle private messages
    socket.on(
      "private message",
      async ({ from, to, message, productImageUrl, productId }) => {
        console.log(
          `Private message from ${from} to ${to} about product ${productId}: ${message}`
        );

        try {
          // Validate ObjectId formats
          if (
            !mongoose.Types.ObjectId.isValid(from) ||
            !mongoose.Types.ObjectId.isValid(to) ||
            !mongoose.Types.ObjectId.isValid(productId)
          ) {
            console.log(
              "Invalid user ID or product ID format:",
              from,
              to,
              productId
            );
            return;
          }

          // Find or create the conversation based on participants and productId
          let conversation = await Conversation.findOne({
            participants: { $all: [from, to] },
            productId, // Ensure it matches the product ID
          });

          if (!conversation) {
            conversation = new Conversation({
              participants: [from, to],
              productId,
              productImageUrl,
            });
            await conversation.save();

            // Update users' conversation lists
            await User.findByIdAndUpdate(from, {
              $push: { conversations: conversation._id },
            });
            await User.findByIdAndUpdate(to, {
              $push: { conversations: conversation._id },
            });
          }

          // Create and save the new message
          const newMessage = new Message({
            conversationId: conversation._id,
            from,
            to,
            message,
            timestamp: new Date(),
          });
          await newMessage.save();
          console.log(`Message saved to conversation ${conversation._id}`);

          // Prepare the message data to emit
          const messageData = {
            conversationId: conversation._id,
            from,
            to,
            message,
            timestamp: newMessage.timestamp, // Ensure timestamp is included
            productId, // Include productId for clarity
          };

          // Emit the message to the sender and recipient
          io.to(from).emit("newMessage", messageData); // Send to sender
          console.log(`Emitted newMessage to sender (${from})`);

          io.to(to).emit("newMessage", messageData); // Send to recipient
          console.log(`Emitted newMessage to recipient (${to})`);
        } catch (error) {
          console.error("Error handling private message:", error);
        }
      }
    );

    socket.on("disconnect", (reason) => {
      console.log(`User ${userId} disconnected: ${reason}`);
    });
  });

  return io;
};

module.exports = socketServer;
