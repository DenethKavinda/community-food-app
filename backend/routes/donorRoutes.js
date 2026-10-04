const express = require("express");
const router = express.Router();
const donorController = require("../controllers/donorController");
const authMiddleware = require("../middleware/authMiddleware");

// Routes for Food Donations
router.post("/", authMiddleware, donorController.createDonation);
router.get("/my-donations", authMiddleware, donorController.getDonorDonations);
router.get("/:id", authMiddleware, donorController.getDonationById);
router.patch("/:id/status", authMiddleware, donorController.updateDonationStatus);
router.delete("/:id", authMiddleware, donorController.deleteDonation);

module.exports = router;
