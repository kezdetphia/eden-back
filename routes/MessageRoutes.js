const express = require("express");
const router = express.Router();
const MessageController = require("../controllers/MessageController");

// Ensure specific routes are defined before more general ones
router.get("/conversation/user/:id", MessageController.getUserIdsConversations);

router.get(
  "/conversationbetween/:userId1/:userId2",
  MessageController.getConversationBetweenTwo
);

router.post("/send", MessageController.sendMessage);

// router.get(
//   "/conversation/:conversationId",
//   MessageController.getConversationByConversationId
// );

// router.get(
//   "/getmychatpartnersdata/:myUserId",
//   MessageController.getAllMyChatPartnersUserData
// );

module.exports = router;
