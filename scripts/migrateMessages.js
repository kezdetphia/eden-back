// scripts/migrateMessages.js
require("dotenv").config();
// scripts/migrateMessages.js
const mongoose = require("mongoose");
const Conversation = require("../models/ConversationModel");
const Message = require("../models/MessageModel");

const migrateMessages = async () => {
  try {
    // Connect to MongoDB on the correct port (27017)
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for migration.");

    // Find all conversations that have messages
    const conversations = await Conversation.find({
      messages: { $exists: true, $not: { $size: 0 } },
    });

    console.log(`Found ${conversations.length} conversations with messages.`);

    for (const convo of conversations) {
      const { _id: conversationId, participants, messages } = convo;

      // Validate that 'messages' is an array
      if (!Array.isArray(messages)) {
        console.warn(
          `Skipping conversation ${conversationId}: 'messages' is not an array. Actual type: ${typeof messages}`
        );
        continue; // Skip this conversation
      }

      for (const msg of messages) {
        const { from, message, timestamp } = msg;

        // Validate required fields
        if (!from || !message || !timestamp) {
          console.log(
            `Skipping invalid message in conversation ${conversationId}`
          );
          continue;
        }

        // Determine the recipient (assuming two participants)
        const to = participants.find((p) => p.toString() !== from.toString());

        if (!to) {
          console.log(
            `No recipient found for message in conversation ${conversationId}`
          );
          continue;
        }

        // Check if the message already exists to prevent duplicates
        const existingMessage = await Message.findOne({
          conversationId,
          from,
          to,
          message,
          timestamp,
        });

        if (existingMessage) {
          console.log(
            `Message already exists in conversation ${conversationId}, skipping.`
          );
          continue;
        }

        // Create a new Message document
        const newMessage = new Message({
          conversationId,
          from,
          to,
          message,
          timestamp,
        });

        await newMessage.save();
        console.log(`Migrated message to conversation ${conversationId}`);
      }

      // Optionally, clear the messages array in Conversation
      convo.messages = [];
      await convo.save();
      console.log(
        `Cleared embedded messages for conversation ${conversationId}`
      );
    }

    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
};

migrateMessages();
