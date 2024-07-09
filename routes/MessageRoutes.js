const express = require("express");
const router = express.Router();
const MessageController = require("../controllers/MessageController");

router.get("/:userId1/:userId2", MessageController.getConversation);

module.exports = router;
