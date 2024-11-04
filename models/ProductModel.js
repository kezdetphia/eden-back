const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    zipcode: { type: String },
    availableQuantity: { type: String },
    geoLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    image: { type: [String] },
    desc: { type: String },
    tier: { type: String },
    price: { type: String },
    exchangeFor: { type: [String] },
    comments: [
      {
        text: { type: String },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Create a 2dsphere index for the geoLocation field
ProductSchema.index({ geoLocation: "2dsphere" });

module.exports = mongoose.model("Product", ProductSchema);
