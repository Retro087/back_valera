const express = require("express");
const router = express.Router();

const {
  authenticateToken,
  checkAuth,
} = require("../middleware/authMiddleware");
const {
  getAllFlowers,
  getFlowerById,
} = require("../controllers/flowersController");

// Защита всех маршрутов товаров

router.get("/", getAllFlowers);
router.get("/:id", checkAuth, getFlowerById);

module.exports = router;
