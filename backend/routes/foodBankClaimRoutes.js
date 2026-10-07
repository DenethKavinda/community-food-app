const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const controller = require("../controllers/foodBankClaimController");

router.post("/", authMiddleware, controller.createClaim);
router.get("/history", authMiddleware, controller.getClaimHistory);

module.exports = router;
