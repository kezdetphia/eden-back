const express = require("express");
const router = express.Router();
const MessageController = require("../controllers/MessageController");

// Get all conversations for a user
router.get("/conversation/user/:id", MessageController.getUserConversations);

// Get messages between two users
router.get(
  "/conversationbetween/:userId1/:userId2",
  MessageController.getMessagesBetweenTwo
);

// Send a new message
router.post("/send", MessageController.sendMessage);

router.get(
  "/conversationbetween/:userId1/:userId2/:productId",
  MessageController.getMessagesBetweenTwoUsersForProduct
);

module.exports = router;
