const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
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
    availableQuantity: {
      type: String,
      required: false,
    },
    location: {
      type: String,
      // required: true,
    },
    image: {
      type: [String],
      required: false,
    },
    desc: {
      type: String,
      required: false,
    },
    tier: {
      type: String,
    },
    price: {
      type: String,
    },
    exchangeFor: {
      type: [String],
      required: false,
    },
    location: {
      type: String,
      required: true,
    },
    comments: [
      {
        text: {
          type: String,
          // required: true,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          // required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
