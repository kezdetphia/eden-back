// const express = require("express");
// const router = express.Router();
// const MessageController = require("../controllers/MessageController");

// // Ensure specific routes are defined before more general ones
// router.get("/conversation/user/:id", MessageController.getUserIdsConversations);

// router.get(
//   "/conversationbetween/:userId1/:userId2",
//   MessageController.getConversationBetweenTwo
// );

// // router.get(
// //   "/conversation/:conversationId",
// //   MessageController.getConversationByConversationId
// // );

// // router.get(
// //   "/getmychatpartnersdata/:myUserId",
// //   MessageController.getAllMyChatPartnersUserData
// // );

// module.exports = router;

// routes/messageRoutes.js
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

module.exports = router;
