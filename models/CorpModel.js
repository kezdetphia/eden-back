const mongoose = require("mongoose");

const CorpSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: String,
      required: false,
    },
    location: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    desc: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const Corp = mongoose.model("Corp", CorpSchema);

module.exports = Corp;
