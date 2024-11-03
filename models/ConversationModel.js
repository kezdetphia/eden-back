// models/ConversationModel.js
const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // Assuming there's a Product model
      required: true,
    },
    productImageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for faster queries on participants and productId
conversationSchema.index({ participants: 1, productId: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
