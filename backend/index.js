const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authController = require("./controllers/authController");

// Ensure DB connection initializes
require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.post("/api/auth/register", authController.register);
app.post("/api/auth/login", authController.login);

// Health Check Route
app.get("/", (req, res) => {
  res.send("Surplus Food Donation API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
