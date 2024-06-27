const express = require("express");
const router = express.Router();
const CorpController = require("../controllers/CorpController");

// Register a new user
router.get("/getcorps", CorpController.getAllCorps);

router.post("/createcorp", CorpController.createCorp);

router.get("/getcorp/:id", CorpController.getCorp);

module.exports = router;
