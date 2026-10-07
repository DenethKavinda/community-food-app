const express = require("express");
const router = express.Router();
const foodItemController = require("../controllers/foodItemController");
const authMiddleware = require("../middleware/authMiddleware");

// Routes for Food Item Management (CRUD)
router.post("/", authMiddleware, foodItemController.createFoodItem);
router.get("/", authMiddleware, foodItemController.getFoodItems);
router.get("/:id", authMiddleware, foodItemController.getFoodItemById);
router.put("/:id", authMiddleware, foodItemController.updateFoodItem);
router.delete("/:id", authMiddleware, foodItemController.deleteFoodItem);

module.exports = router;
