const express = require("express");
const router = express.Router();

const {
  getDriverPickups,
  updateDriverTaskStatus,
  getDriverHistory,
} = require("../controllers/driverController");

router.get("/pickups", getDriverPickups);

router.patch("/task-status", updateDriverTaskStatus);

router.get("/history", getDriverHistory);

module.exports = router;