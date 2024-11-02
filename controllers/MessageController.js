const mongoose = require("mongoose");
const Conversation = require("../models/MessageModel");
const User = require("../models/UserModel");
const express = require("express");
const router = express.Router();

//this is used
const getConversationBetweenTwo = async (req, res) => {
  const { userId1, userId2 } = req.params;
  console.log("Received userId1:", userId1, "Received userId2:", userId2);
  try {
    if (
      !mongoose.Types.ObjectId.isValid(userId1) ||
      !mongoose.Types.ObjectId.isValid(userId2)
    ) {
      console.log("Invalid user ID format:", userId1, userId2);
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    const objectId1 = new mongoose.Types.ObjectId(String(userId1));
    const objectId2 = new mongoose.Types.ObjectId(String(userId2));
    console.log(
      "Converted ObjectId1:",
      objectId1,
      "Converted ObjectId2:",
      objectId2
    );

    const conversation = await Conversation.findOne({
      participants: {
        $all: [objectId1, objectId2],
      },
    }).populate("messages.from", "username");

    if (!conversation) {
      return res.status(200).json({ message: "Conversation not found" });
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//this is used
const getUserIdsConversations = async (req, res) => {
  const { id } = req.params;
  console.log("getConversationByUserId params", req.params);

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("Invalid user ID format:", id);
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const objectId = mongoose.Types.ObjectId.createFromHexString(id); // Use createFromHexString
    console.log("Converted ObjectId:", objectId); // Log the converted ObjectId

    const myChats = await Conversation.find({
      participants: objectId,
    }).populate("participants", "username avatar");

    if (!myChats || myChats.length === 0) {
      return res
        .status(404)
        .json({ message: "You have no conversations yet!" });
    }

    res.status(200).json(myChats);
  } catch (err) {
    console.log("error", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const sendMessage = async (req, res) => {
  const { from, to, message } = req.body;

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
      // Create a new conversation
      conversation = new Conversation({
        participants: [from, to],
        messages: [],
      });
    }

    // Create the new message
    const newMessage = {
      from,
      message,
      timestamp: new Date(),
    };

    // Add the message to the conversation
    conversation.messages.push(newMessage);

    // Save the conversation
    await conversation.save();

    // Emit the message via WebSocket
    const io = req.app.get("socketio");
    io.to(to).emit("newMessage", {
      conversationId: conversation._id,
      message: newMessage,
    });

    res.status(200).json({ message: "Message sent successfully." });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//not used but great function so keeping it for now
// const getConversationByConversationId = async (req, res) => {
//   const { conversationId } = req.params;
//   try {
//     if (!mongoose.Types.ObjectId.isValid(conversationId)) {
//       return res
//         .status(400)
//         .json({ message: "Invalid conversation ID format" });
//     }

//     const objectId =
//       mongoose.Types.ObjectId.createFromHexString(conversationId);
//     const myChats = await Conversation.find({ _id: objectId });
//     if (!myChats || myChats.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "There's no conversation with this id!" });
//     }
//     res.status(200).json(myChats);
//   } catch (err) {
//     console.log("error", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

//not used but great function so keeping it for now
// const getAllMyChatPartnersUserData = async (req, res) => {
//   const { myUserId } = req.params;

//   console.log("Received myUserId:", myUserId); // Log the received user ID

//   try {
//     if (!mongoose.Types.ObjectId.isValid(myUserId)) {
//       console.log("Invalid user ID format:", myUserId);
//       return res.status(400).json({ message: "Invalid user ID format" });
//     }

//     const objectId = mongoose.Types.ObjectId.createFromHexString(myUserId); // Convert to ObjectId using createFromHexString
//     console.log("Converted ObjectId:", objectId);

//     // Find conversations where the user is a participant
//     const conversations = await Conversation.find({
//       participants: objectId,
//     }).populate("participants", "username _id avatar");

//     if (!conversations || conversations.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "You have no conversations yet!" });
//     }

//     // Extract participant IDs excluding myUserId
//     const partnerIds = conversations.flatMap((conversation) =>
//       conversation.participants
//         .filter((participant) => !participant._id.equals(objectId))
//         .map((participant) => participant._id)
//     );

//     // Find user details of the remaining participants
//     const chatPartners = await User.find(
//       { _id: { $in: partnerIds } },
//       "username avatar"
//     );

//     res.status(200).json(chatPartners);
//   } catch (err) {
//     console.log("Server error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

module.exports = {
  getConversationBetweenTwo,
  getUserIdsConversations,
  sendMessage,
  // getConversationByConversationId,
  // getAllMyChatPartnersUserData,
};
