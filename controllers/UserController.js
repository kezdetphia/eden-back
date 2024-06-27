const User = require("../models/UserModel");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signUp = async (req, res) => {
  const { username, email, password, passwordRepeat } = req.body;
  try {
    const isExistingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (isExistingUser) {
      if (isExistingUser.email === email) {
        return res.status(400).json({ message: "Email already exists" });
      }
      if (isExistingUser.username === username) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    } else if (password !== passwordRepeat) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

const signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log("SignIn request received:", { email, password });

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(400).json({ message: "User not found" });
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      console.log("Password is incorrect for user:", email);
      return res.status(400).json({ message: "Password is incorrect" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Optional: Set token expiration time
    );

    // Ensure user._doc exists and destructure safely
    const {
      __v,
      updatedAt,
      password: userPassword,
      ...userData
    } = user._doc || {};
    console.log("User authenticated successfully:", userData);

    res
      .status(200)
      .json({ userData: { ...userData }, token, message: "Successful login" });
  } catch (err) {
    console.error("Server error during signIn:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getUserWithCorps = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).populate("myCorps");
    if (user) {
      const { password, ...userWithoutPassword } = user.toObject();
      console.log(userWithoutPassword);
      res.status(200).json(userWithoutPassword);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user with corps:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  signUp,
  signIn,
  getUser,
  getUserWithCorps,
};
