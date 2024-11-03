const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    location: {
      type: String,
      // required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    inNeedOf: {
      type: [String],
      required: false,
    },
    avatar: {
      type: String,
    },
    conversations: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
    ],
    deviceToken: {
      type: String, // For push notifications
    },
  },
  { timestamps: true }
);

userSchema.virtual("myProducts", {
  ref: "Product",
  localField: "_id",
  foreignField: "owner",
});

userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
