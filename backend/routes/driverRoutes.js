const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  getDriverPickups,
  updateDriverTaskStatus,
  getDriverHistory,
  uploadDriverTaskPhoto,
} = require("../controllers/driverController");

router.use(authMiddleware);

router.get("/pickups", getDriverPickups);

router.patch("/task-status", updateDriverTaskStatus);
router.post(
  "/upload-photo",
  upload.single("photo"),
  uploadDriverTaskPhoto
);

router.get("/history", getDriverHistory);

module.exports = router;