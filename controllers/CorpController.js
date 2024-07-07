const mongoose = require("mongoose");
const Corp = require("../models/CorpModel");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const getAllCorps = async (req, res) => {
  try {
    const corps = await Corp.find();
    return res.status(200).json({ corps });
  } catch (error) {
    console.error("Error fetching corporations:", error);
    return res.status(500).json({
      error:
        "An error occurred while fetching corporations. Please try again later.",
    });
  }
};

const createCorp = async (req, res) => {
  try {
    // Validate request body
    if (
      !req.body.title ||
      !req.body.category ||
      !req.body.owner ||
      !req.body.location
    ) {
      return res.status(400).json({
        error: "Missing required fields: name, category, owner, location",
      });
    }

    // Create the crop
    const corp = await Corp.create(req.body);
    res.status(201).json({ corp });
  } catch (error) {
    console.error("Error creating corporation:", error);

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
        "An error occurred while creating the corporation. Please try again later.",
    });
  }
};

const getCorp = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const corp = await Corp.findById(id)
      .populate({
        path: "owner",
        model: "User",
        select: "-password", //exclude password
      })
      .populate({
        path: "comments.user",
        model: "User",
        select: "username email", // Select the fields you want to include
      });
    if (!corp) {
      return res.status(404).json({ error: "Corp not found" });
    }

    res.status(200).json({ corp });
  } catch (error) {
    console.error("Error fetching corp:", error);
    res.status(500).json({
      error:
        "An error occurred while fetching the corp. Please try again later.",
    });
  }
};
//this WORKS
// const addCommentToCrop = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { comment } = req.body;

//     const corp = await Corp.findById(id);
//     if (!corp) {
//       return res.status(404).json({ error: "Corp not found" });
//     }

//     // Ensure comments is an array and push the new comment
//     corp.comments = corp.comments || [];
//     corp.comments.push(comment);
//     await corp.save();

//     // Populate the user field in the comments
//     const updatedCorp = await Corp.findById(id).populate("comments.user");

//     res
//       .status(200)
//       .json({ message: "Comment added successfully", corp: updatedCorp });
//   } catch (error) {
//     console.error("Error adding comment to corp:", error);
//     res.status(500).json({
//       error:
//         "An error occurred while adding the comment. Please try again later.",
//     });
//   }
// };
const addCommentToCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const corp = await Corp.findById(id);
    if (!corp) {
      return res.status(404).json({ error: "Corp not found" });
    }

    // Ensure comments is an array and push the new comment with user details
    corp.comments = corp.comments || [];
    corp.comments.push({
      text: comment.text,
      userId: comment.userId,
      username: comment.username,
      createdAt: new Date(),
    });
    await corp.save();

    res.status(200).json({ message: "Comment added successfully", corp });
  } catch (error) {
    console.error("Error adding comment to corp:", error);
    res.status(500).json({
      error:
        "An error occurred while adding the comment. Please try again later.",
    });
  }
};

module.exports = {
  getAllCorps,
  createCorp,
  getCorp,
  addCommentToCrop,
};
