const express = require("express");
const router = express.Router();
const recipientProfileController = require("../controllers/recipientProfileController");
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

// ─────────────────────────────────────────────
// RECIPIENT PROFILE ROUTES
// Base path: /api/recipient
// ─────────────────────────────────────────────

// GET /api/recipient/profile
router.get("/profile", authMiddleware, recipientProfileController.getRecipientProfile);

// PUT /api/recipient/profile
router.put("/profile", authMiddleware, recipientProfileController.updateRecipientProfile);

// ─────────────────────────────────────────────
// NOTIFICATION ROUTES
// ─────────────────────────────────────────────
router.get("/notifications", authMiddleware, notificationController.getNotifications);
router.patch("/notifications/read-all", authMiddleware, notificationController.markAllAsRead);
router.patch("/notifications/:id/read", authMiddleware, notificationController.markAsRead);

module.exports = router;
