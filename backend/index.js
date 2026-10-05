const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authController = require("./controllers/authController");
const donorRoutes = require("./routes/donorRoutes");
const requestRoutes = require("./routes/requestRoutes");

// Ensure DB connection initializes
require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Auth Routes
app.post("/api/auth/register", authController.register);
app.post("/api/auth/login", authController.login);

// Donor Routes
app.use("/api/donations", donorRoutes);
app.use("/api/requests", requestRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.send("Surplus Food Donation API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
