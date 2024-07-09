const mongoose = require("mongoose");
const Conversation = require("../models/MessageModel");
const express = require("express");
const router = express.Router();

const getConversation = async (req, res) => {
  const { userId1, userId2 } = req.params;

  try {
    const conversation = await Conversation.findOne({
      participants: {
        $all: [
          new mongoose.Types.ObjectId(userId1),
          new mongoose.Types.ObjectId(userId2),
        ],
      },
    }).populate("messages.from", "username"); // Populate the 'from' field with the username

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getConversation,
};
