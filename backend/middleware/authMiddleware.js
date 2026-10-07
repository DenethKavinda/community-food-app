const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "surplus_food_donation_secret_key_2026");
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT Verification error:", error.message);
    req.user = null;
    next();
  }
};

module.exports = authMiddleware;
