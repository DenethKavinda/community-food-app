const pool = require("../config/db");

// ─────────────────────────────────────────────
// 1. GET RECIPIENT PROFILE (READ)
// GET /api/recipient/profile
// ─────────────────────────────────────────────
exports.getRecipientProfile = async (req, res) => {
  // 1. Authentication check
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  // 2. Role verification - strict check for RECIPIENT role
  if (req.user.role !== "RECIPIENT") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only recipient users can access this profile endpoint.",
    });
  }

  const recipient_id = req.user.id;

  try {
    // 3. Query only recipient-allowed fields (no password, nic, or sensitive data)
    const [users] = await pool.query(
      "SELECT id, name, email, phone, address FROM users WHERE id = ? AND role = 'RECIPIENT'",
      [recipient_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Recipient profile not found.",
      });
    }

    const profile = users[0];

    return res.json({
      success: true,
      profile: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone || "",
        address: profile.address || "",
      },
    });
  } catch (error) {
    console.error("getRecipientProfile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching recipient profile.",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// 2. UPDATE RECIPIENT PROFILE (UPDATE)
// PUT /api/recipient/profile
// ─────────────────────────────────────────────
exports.updateRecipientProfile = async (req, res) => {
  // 1. Authentication check
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  // 2. Role verification - strict check for RECIPIENT role
  if (req.user.role !== "RECIPIENT") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only recipient users can access this profile endpoint.",
    });
  }

  const recipient_id = req.user.id;
  const { name, phone, address } = req.body;

  // 3. Validate editable fields
  if (!name || !String(name).trim()) {
    return res.status(400).json({
      success: false,
      message: "Full Name is required and cannot be empty.",
    });
  }

  if (!phone || !String(phone).trim()) {
    return res.status(400).json({
      success: false,
      message: "Phone Number is required and cannot be empty.",
    });
  }

  if (!address || !String(address).trim()) {
    return res.status(400).json({
      success: false,
      message: "Address is required and cannot be empty.",
    });
  }

  try {
    // 4. Verify recipient user exists
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE id = ? AND role = 'RECIPIENT'",
      [recipient_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Recipient profile not found.",
      });
    }

    // 5. Perform update on ONLY allowed fields (name, phone, address)
    await pool.query(
      "UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ? AND role = 'RECIPIENT'",
      [name.trim(), phone.trim(), address.trim(), recipient_id]
    );

    // 6. Fetch and return updated recipient profile
    const [updatedUsers] = await pool.query(
      "SELECT id, name, email, phone, address FROM users WHERE id = ? AND role = 'RECIPIENT'",
      [recipient_id]
    );

    const updatedProfile = updatedUsers[0];

    return res.json({
      success: true,
      message: "Recipient profile updated successfully.",
      profile: {
        id: updatedProfile.id,
        name: updatedProfile.name,
        email: updatedProfile.email,
        phone: updatedProfile.phone || "",
        address: updatedProfile.address || "",
      },
    });
  } catch (error) {
    console.error("updateRecipientProfile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating recipient profile.",
      error: error.message,
    });
  }
};
