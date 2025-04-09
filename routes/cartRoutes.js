const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { authenticateToken } = require("../middleware/authMiddleware");

// API endpoint for get cart
router.get("/:userId", cartController.getCart);
router.get("/:flowerId", authenticateToken, cartController.checkInCart);

// API endpoint for add to cart
router.post("/", cartController.addToCart);

// API endpoint for delete from cart
router.delete("/:id", cartController.deleteCartItem);

router.patch("/:id", authenticateToken, cartController.updateCartItem);

module.exports = router;
