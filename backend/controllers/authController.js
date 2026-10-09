const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

// Ensure upload directory exists for avatars
const avatarUploadsDir = path.join(__dirname, "../uploads/avatars");
if (!fs.existsSync(avatarUploadsDir)) {
  fs.mkdirSync(avatarUploadsDir, { recursive: true });
}

// Auto-ensure avatar_url, latitude, longitude columns exist in users table
const ensureUserColumns = async () => {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM users LIKE 'avatar_url'");
    if (cols.length === 0) {
      await pool.query("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) NULL AFTER organization_name");
    }
    const [latCols] = await pool.query("SHOW COLUMNS FROM users LIKE 'latitude'");
    if (latCols.length === 0) {
      await pool.query("ALTER TABLE users ADD COLUMN latitude DECIMAL(10, 8) NULL AFTER address");
    }
    const [lngCols] = await pool.query("SHOW COLUMNS FROM users LIKE 'longitude'");
    if (lngCols.length === 0) {
      await pool.query("ALTER TABLE users ADD COLUMN longitude DECIMAL(11, 8) NULL AFTER latitude");
    }
  } catch (err) {
    console.warn("Could not check/add user table columns:", err.message);
  }
};
ensureUserColumns();

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
        phone: user.phone,
        address: user.address,
        organization_name: user.organization_name,
        avatar_url: user.avatar_url || null,
        latitude: user.latitude || null,
        longitude: user.longitude || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET LOGGED-IN USER PROFILE
exports.getProfile = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  try {
    const [users] = await pool.query(
      "SELECT id, name, email, role, phone, address, organization_name, avatar_url, latitude, longitude, is_approved, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "User profile not found." });
    }

    res.json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// UPDATE LOGGED-IN USER PROFILE
exports.updateProfile = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  const { name, email, phone, address, organization_name, avatar_url, avatar_base64, latitude, longitude } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: "Full Name is required." });
  }

  try {
    // Check if email already belongs to another user
    if (email && email.trim()) {
      const [existingUsers] = await pool.query(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email.trim(), req.user.id]
      );
      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email address is already in use by another account.",
        });
      }
    }

    let finalAvatarUrl = undefined;

    // Handle base64 avatar upload if provided
    if (avatar_base64) {
      try {
        const matches = avatar_base64.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        let ext = "jpg";
        let base64Data = avatar_base64;

        if (matches && matches.length === 3) {
          ext = matches[1];
          base64Data = matches[2];
        }

        const fileName = `avatar-user-${req.user.id}-${Date.now()}.${ext}`;
        const filePath = path.join(avatarUploadsDir, fileName);

        fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
        finalAvatarUrl = `/uploads/avatars/${fileName}`;
      } catch (imgError) {
        console.error("Avatar base64 save error:", imgError.message);
      }
    } else if (avatar_url !== undefined) {
      finalAvatarUrl = avatar_url;
    }

    // Preserve existing avatar_url if not provided
    if (finalAvatarUrl === undefined) {
      const [current] = await pool.query("SELECT avatar_url FROM users WHERE id = ?", [req.user.id]);
      finalAvatarUrl = current[0]?.avatar_url || null;
    }

    let parsedLat = latitude !== undefined && latitude !== null ? parseFloat(latitude) : null;
    let parsedLng = longitude !== undefined && longitude !== null ? parseFloat(longitude) : null;
    if (isNaN(parsedLat)) parsedLat = null;
    if (isNaN(parsedLng)) parsedLng = null;

    await pool.query(
      `UPDATE users
       SET name = ?,
           email = ?,
           phone = ?,
           address = ?,
           organization_name = ?,
           avatar_url = ?,
           latitude = ?,
           longitude = ?
       WHERE id = ?`,
      [
        name.trim(),
        email ? email.trim() : null,
        phone ? phone.trim() : null,
        address ? address.trim() : null,
        organization_name ? organization_name.trim() : null,
        finalAvatarUrl,
        parsedLat,
        parsedLng,
        req.user.id,
      ]
    );

    const [updatedUsers] = await pool.query(
      "SELECT id, name, email, role, phone, address, organization_name, avatar_url, latitude, longitude, is_approved, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUsers[0],
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ success: false, message: "Server error updating profile", error: error.message });
  }
};

// CHANGE PASSWORD FOR LOGGED-IN USER
exports.changePassword = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Please enter both your current password and new password.",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters long.",
    });
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "New password and confirmation password do not match.",
    });
  }

  try {
    const [users] = await pool.query("SELECT id, password FROM users WHERE id = ?", [
      req.user.id,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    const user = users[0];

    let isMatch = false;
    if (user.password) {
      if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$") || user.password.startsWith("$2y$")) {
        isMatch = await bcrypt.compare(currentPassword, user.password);
      } else {
        isMatch = currentPassword === user.password;
      }
    }

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      req.user.id,
    ]);

    res.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("changePassword error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating password.",
      error: error.message,
    });
  }
};

