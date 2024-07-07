const express = require("express");
const router = express.Router();
const CorpController = require("../controllers/CorpController");
const { verifyToken } = require("../middleware/veryfiToken");

// Register a new user
router.get("/getcorps", verifyToken, CorpController.getAllCorps);

router.post("/createcorp", verifyToken, CorpController.createCorp);

router.get("/getcorp/:id", verifyToken, CorpController.getCorp);

module.exports = router;
