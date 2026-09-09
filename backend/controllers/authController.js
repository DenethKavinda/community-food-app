const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER USER
exports.register = async (req, res) => {
  const {
    name,
    nic,
    email,
    password,
    role,
    phone,
    address,
    business_name,
    organization_name,
    register_number,
    license_number,
  } = req.body;

  // 1. Basic validation
  if (!name || !nic || !email || !password || !role) {
    return res.status(400).json({
      message:
        "Please provide all required fields (Name, NIC, Email, Password, Role).",
    });
  }

  // 2. Restrict direct ADMIN signups
  const allowedRoles = ["DONOR", "RECIPIENT", "DRIVER", "FOOD_BANK"];
  if (!allowedRoles.includes(role)) {
    return res
      .status(400)
      .json({ message: "Invalid registration role specified." });
  }

  try {
    // 3. Check if user already exists by Email or NIC
    const [existingUsers] = await pool.query(
      "SELECT * FROM users WHERE email = ? OR nic = ?",
      [email, nic],
    );

    if (existingUsers.length > 0) {
      return res
        .status(400)
        .json({ message: "An account with this Email or NIC already exists." });
    }

    // 4. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Require admin verification for Drivers and Food Banks
    const isApproved = role === "DRIVER" || role === "FOOD_BANK" ? 0 : 1;

    // 6. Consolidate Donor business name or Food Bank organization name
    const orgName = role === "FOOD_BANK" ? organization_name : business_name;

    // 7. Insert new user record
    const [result] = await pool.query(
      `INSERT INTO users 
      (name, nic, email, password, role, phone, address, organization_name, register_number, license_number, is_approved) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        nic,
        email,
        hashedPassword,
        role,
        phone || null,
        address || null,
        orgName || null,
        register_number || null,
        license_number || null,
        isApproved,
      ],
    );

    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId,
      requiresApproval: !isApproved,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// LOGIN USER
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please enter both email and password." });
  }

  try {
    // 1. Locate user by email
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    // 2. Validate password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Create signed JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_approved: user.is_approved,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
