const express = require("express");
const router = express.Router();
const donorController = require("../controllers/donorController");
const authMiddleware = require("../middleware/authMiddleware");

// Routes for Food Donations
router.post("/", authMiddleware, donorController.createDonation);
router.get("/stats", authMiddleware, donorController.getDonorStats);
router.get("/notifications", authMiddleware, donorController.getNotifications);
router.patch("/notifications/read-all", authMiddleware, donorController.markAllAsRead);
router.patch("/notifications/:id/read", authMiddleware, donorController.markAsRead);
router.get("/my-donations", authMiddleware, donorController.getDonorDonations);
router.get("/available", authMiddleware, donorController.getAvailableDonations);
router.get("/:id", authMiddleware, donorController.getDonationById);
router.patch("/:id/status", authMiddleware, donorController.updateDonationStatus);
router.delete("/:id", authMiddleware, donorController.deleteDonation);

module.exports = router;
