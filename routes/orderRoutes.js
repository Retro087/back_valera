const express = require("express");
const router = express.Router();

const { createOrder } = require("../controllers/orderController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/", authenticateToken, createOrder);

module.exports = router;
