const mongoose = require("mongoose");
const Conversation = require("../models/ConversationModel");
const Message = require("../models/MessageModel");
const User = require("../models/UserModel");

// Send a new message
const sendMessage = async (req, res) => {
  const { from, to, message, productImageUrl } = req.body;

  try {
    // Validate ObjectId formats
    if (
      !mongoose.Types.ObjectId.isValid(from) ||
      !mongoose.Types.ObjectId.isValid(to)
    ) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Find or create the conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [from, to] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [from, to],
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
    });
    await newMessage.save();

    // Emit the message via WebSocket
    const io = req.app.get("socketio");
    io.to(from).emit("newMessage", {
      conversationId: conversation._id,
      from,
      to,
      message,
      timestamp: newMessage.timestamp,
    });
    io.to(to).emit("newMessage", {
      conversationId: conversation._id,
      from,
      to,
      message,
      timestamp: newMessage.timestamp,
    });

    res.status(200).json({ message: "Message sent successfully." });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get conversations for a user
const getUserConversations = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const conversations = await Conversation.find({ participants: id })
      .populate("participants", "username avatar")
      .sort({ updatedAt: -1 });

    if (!conversations || conversations.length === 0) {
      return res
        .status(404)
        .json({ message: "You have no conversations yet!" });
    }

    res.status(200).json(conversations);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get messages between two users
const getMessagesBetweenTwo = async (req, res) => {
  const { userId1, userId2 } = req.params;

  try {
    if (
      !mongoose.Types.ObjectId.isValid(userId1) ||
      !mongoose.Types.ObjectId.isValid(userId2)
    ) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [userId1, userId2] },
    });

    if (!conversation) {
      return res.status(200).json({ messages: [] }); // Return empty messages if no conversation
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ timestamp: 1 }) // Sort messages chronologically
      .populate("from", "username avatar");

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMessagesBetweenTwoUsersForProduct = async (req, res) => {
  const { userId1, userId2, productId } = req.params;

  try {
    if (
      !mongoose.Types.ObjectId.isValid(userId1) ||
      !mongoose.Types.ObjectId.isValid(userId2) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Find the conversation based on participants and productId
    const conversation = await Conversation.findOne({
      participants: { $all: [userId1, userId2] },
      productId, // Filter by productId
    });

    if (!conversation) {
      return res.status(200).json({ messages: [] }); // Return empty if no conversation found
    }

    // Fetch all messages for the conversation, sorted by timestamp
    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ timestamp: 1 }) // Sort messages in chronological order
      .populate("from", "username avatar");

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  sendMessage,
  getUserConversations,
  getMessagesBetweenTwo,
  getMessagesBetweenTwoUsersForProduct,
};
