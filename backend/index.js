const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authController = require("./controllers/authController");
const authRoutes = require("./routes/authRoutes");
const donorRoutes = require("./routes/donorRoutes");
const requestRoutes = require("./routes/requestRoutes");
const recipientRoutes = require("./routes/recipientRoutes");
const foodItemRoutes = require("./routes/foodItemRoutes");
const foodBankClaimRoutes = require("./routes/foodBankClaimRoutes");
const foodBankInventoryRoutes = require("./routes/foodBankInventoryRoutes");
const driverRoutes = require("./routes/driverRoutes");

// Ensure DB connection initializes
require("./config/db");

// Start offline donation expiration scheduler
const { initDonationExpiryScheduler } = require("./jobs/donationExpiryScheduler");
initDonationExpiryScheduler();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Auth & Profile Routes
app.use("/api/auth", authRoutes);

// Donor & Request & Recipient Routes
// API Routes
app.use("/api/food-items", foodItemRoutes);
app.use("/api/donations", donorRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/recipient", recipientRoutes);
app.use("/api/food-bank-claims", foodBankClaimRoutes);
app.use("/api/food-bank-inventory", foodBankInventoryRoutes);
app.use("/api/driver", driverRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.send("Surplus Food Donation API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
