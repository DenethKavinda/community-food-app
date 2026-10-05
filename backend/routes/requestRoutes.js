const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");
const authMiddleware = require("../middleware/authMiddleware");

// Routes for Recipient Requests
router.post("/", authMiddleware, requestController.createRequest);
router.get("/my-requests", authMiddleware, requestController.getMyRequests);
router.get("/:id", authMiddleware, requestController.getRequestById);
router.patch("/:id/cancel", authMiddleware, requestController.cancelRequest);
router.patch("/:id", authMiddleware, requestController.updateRequest);

module.exports = router;
