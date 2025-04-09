const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");
const { sendMessage, getUserChats } = require("../controllers/chatController");

router.post("/", authenticateToken, sendMessage);
router.get("/", authenticateToken, getUserChats);

module.exports = router;
