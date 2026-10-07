const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const controller = require("../controllers/foodBankInventoryController");

router.get("/", authMiddleware, controller.getInventory);
router.post("/", authMiddleware, controller.createInventoryItem);
router.delete("/:id", authMiddleware, controller.deleteInventoryItem);

module.exports = router;
