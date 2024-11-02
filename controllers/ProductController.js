const mongoose = require("mongoose");
const Product = require("../models/ProductModel");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find(
      {},
      "_id title location availableQuantity category image tier createdAt  "
    );
    return res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      error:
        "An error occurred while fetching products. Please try again later.",
    });
  }
};

const createProduct = async (req, res) => {
  try {
    console.log("Request body:", req.body); // Log the request body
    // Validate request body
    if (
      !req.body.title ||
      !req.body.category ||
      !req.body.owner ||
      !req.body.location
    ) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // Create the Product
    const product = await Product.create(req.body);
    res.status(201).json({ product });
  } catch (error) {
    console.error("Error creating product:", error);

    // Handle specific error types
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: "Validation Error: " + error.message });
    } else if (error.name === "MongoError" && error.code === 11000) {
      return res
        .status(409)
        .json({ error: "Duplicate key error: " + error.message });
    }

    // General error response
    res.status(500).json({
      error:
        "An error occurred while creating the product. Please try again later.",
    });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const product = await Product.findById(id)
      .populate({
        path: "owner",
        model: "User",
        select: "_id avatar username createdAt ", //exclude password, conversations, email; include location, tier
      })
      .populate({
        path: "comments.user",
        model: "User",
        select: "username email avatar", // Select the fields you want to include
      });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      error:
        "An error occurred while fetching the product. Please try again later.",
    });
  }
};
//this WORKS
const addCommentToProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Ensure comments is an array and push the new comment
    product.comments = product.comments || [];
    product.comments.push(comment);
    await product.save();

    // Populate the user field in the comments
    const updatedProduct = await Product.findById(id).populate("comments.user");

    res
      .status(200)
      .json({ message: "Comment added successfully", product: updatedProduct });
  } catch (error) {
    console.error("Error adding comment to product:", error);
    res.status(500).json({
      error:
        "An error occurred while adding the comment. Please try again later.",
    });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  getProduct,
  addCommentToProduct,
};
