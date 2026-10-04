const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

// Ensure upload directory exists
const uploadsDir = path.join(__dirname, "../uploads/donations");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 1. CREATE NEW FOOD DONATION
exports.createDonation = async (req, res) => {
  const { meal_name, quantity, location, expiry_window, notes, image_base64, image_url } = req.body;
  const donor_id = req.user ? req.user.id : (req.body.donor_id || 1);

  if (!meal_name || !quantity || !location || !expiry_window) {
    return res.status(400).json({
      message: "Please fill in all required fields (Meal Name, Quantity, Location, Expiry Window).",
    });
  }

  try {
    let savedImageUrl = image_url || null;

    // Handle Multer uploaded file if present
    if (req.file) {
      savedImageUrl = `/uploads/donations/${req.file.filename}`;
    } 
    // Handle Base64 Image Upload if provided from Expo
    else if (image_base64) {
      try {
        const matches = image_base64.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        let ext = "jpg";
        let base64Data = image_base64;

        if (matches && matches.length === 3) {
          ext = matches[1];
          base64Data = matches[2];
        }

        const fileName = `donation-${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
        savedImageUrl = `/uploads/donations/${fileName}`;
      } catch (imgError) {
        console.error("Base64 save error:", imgError.message);
      }
    }

    // Default image if none provided
    if (!savedImageUrl) {
      savedImageUrl = "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80";
    }

    const [result] = await pool.query(
      `INSERT INTO donations (donor_id, meal_name, quantity, location, expiry_window, notes, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [donor_id, meal_name, quantity, location, expiry_window, notes || null, savedImageUrl]
    );

    const [newDonation] = await pool.query("SELECT * FROM donations WHERE id = ?", [result.insertId]);

    res.status(201).json({
      message: "Donation post created successfully!",
      donation: newDonation[0],
    });
  } catch (error) {
    console.error("Create donation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 2. GET DONATIONS (Logged-in Donor History or All Posts)
exports.getDonorDonations = async (req, res) => {
  const donor_id = req.user ? req.user.id : (req.query.donor_id || 1);
  const showAll = req.query.all === "true";
  const statusFilter = req.query.status;

  try {
    let query = "SELECT * FROM donations";
    let queryParams = [];

    if (!showAll) {
      query += " WHERE donor_id = ?";
      queryParams.push(donor_id);

      if (statusFilter) {
        query += " AND status = ?";
        queryParams.push(statusFilter);
      }
    } else if (statusFilter) {
      query += " WHERE status = ?";
      queryParams.push(statusFilter);
    }

    query += " ORDER BY created_at DESC";

    const [donations] = await pool.query(query, queryParams);

    res.json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    console.error("Get donations error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 3. GET SINGLE DONATION BY ID
exports.getDonationById = async (req, res) => {
  const { id } = req.params;

  try {
    const [donations] = await pool.query("SELECT * FROM donations WHERE id = ?", [id]);

    if (donations.length === 0) {
      return res.status(404).json({ message: "Donation item not found." });
    }

    res.json({ success: true, donation: donations[0] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 4. UPDATE DONATION STATUS
exports.updateDonationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["Active", "Picked Up", "Completed", "Cancelled"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status provided." });
  }

  try {
    const [result] = await pool.query("UPDATE donations SET status = ? WHERE id = ?", [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Donation item not found." });
    }

    res.json({ message: `Donation status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 5. DELETE DONATION
exports.deleteDonation = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM donations WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Donation item not found." });
    }

    res.json({ message: "Donation post deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
