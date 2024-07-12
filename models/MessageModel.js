const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [messageSchema],
});

// conversationSchema.set("toJSON", {
//   virtuals: true,
//   versionKey: false,
//   transform: (doc, ret) => {
//     delete ret.id;
//     return ret;
//   },
// });

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
