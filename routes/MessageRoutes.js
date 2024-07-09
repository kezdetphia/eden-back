const express = require("express");
const User = require("../models/UserModel");
const Message = require("../models/MessageModel");

const router = express.Router();

// Get messages for a user
router.get("/:userId/messages", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).populate("messages");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user.messages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
