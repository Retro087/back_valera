const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

// API endpoint for get cart
router.get("/:userId", cartController.getCart);

// API endpoint for add to cart
router.post("/", cartController.addToCart);

// API endpoint for delete from cart
router.delete("/:id", cartController.deleteCartItem);

module.exports = router;
