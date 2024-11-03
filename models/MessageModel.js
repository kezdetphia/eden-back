// const mongoose = require("mongoose");

// const messageSchema = new mongoose.Schema({
//   from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   message: String,
//   timestamp: { type: Date, default: Date.now },
// });

// const conversationSchema = new mongoose.Schema({
//   participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   messages: [messageSchema],
//   productImageUrl: String,
// });

// const Conversation = mongoose.model("Conversation", conversationSchema);

// module.exports = Conversation;

// models/MessageModel.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: [true, "Message content is required."],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters."],
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    // Optional: Additional fields for advanced features
    // reactions: [{ type: String }],
    // attachments: [{ type: String }],
  },
  { timestamps: true }
);

// Compound index for efficient retrieval
messageSchema.index({ conversationId: 1, timestamp: -1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
