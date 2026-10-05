const express = require("express");
const router = express.Router();
const recipientProfileController = require("../controllers/recipientProfileController");
const authMiddleware = require("../middleware/authMiddleware");

// ─────────────────────────────────────────────
// RECIPIENT PROFILE ROUTES
// Base path: /api/recipient
// ─────────────────────────────────────────────

// GET /api/recipient/profile
router.get("/profile", authMiddleware, recipientProfileController.getRecipientProfile);

// PUT /api/recipient/profile
router.put("/profile", authMiddleware, recipientProfileController.updateRecipientProfile);

module.exports = router;
