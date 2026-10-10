const pool = require("../config/db");

const VALID_METHODS = ["Volunteer Driver Delivery", "Self Pickup"];
const foodBankClaimsTableReady = pool.query(`
  CREATE TABLE IF NOT EXISTS food_bank_claims (
    id INT AUTO_INCREMENT PRIMARY KEY,
    food_bank_id INT NOT NULL,
    donation_id INT NOT NULL,
    requested_portions INT NOT NULL,
    fulfillment_method ENUM('Volunteer Driver Delivery', 'Self Pickup') NOT NULL,
    pickup_location VARCHAR(500) NOT NULL,
    additional_notes TEXT NULL,
    status ENUM('Pending', 'Assigned', 'Ready for Pickup', 'Completed', 'Cancelled', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (food_bank_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE
  )
`).catch((error) => console.error("Food-bank claims table setup failed:", error));

exports.createClaim = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }
  if (String(req.user.role).toUpperCase() !== "FOOD_BANK") {
    return res.status(403).json({ success: false, message: "Only food banks can claim donations." });
  }

  const { donation_id, fulfillment_method, pickup_location, additional_notes } = req.body;
  if (!donation_id || !VALID_METHODS.includes(fulfillment_method) || !pickup_location?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Donation, fulfillment method, and current/pickup location are required.",
    });
  }

  try {
    await foodBankClaimsTableReady;
    const [donations] = await pool.query(
      "SELECT id, quantity, status FROM donations WHERE id = ?",
      [donation_id]
    );
    if (!donations.length || !["Pending", "Active"].includes(donations[0].status)) {
      return res.status(400).json({ success: false, message: "This donation is no longer available." });
    }

    const [reserved] = await pool.query(
      `SELECT
         COALESCE((SELECT SUM(requested_portions) FROM requests
           WHERE donation_id = ? AND status NOT IN ('Cancelled')), 0) +
         COALESCE((SELECT SUM(requested_portions) FROM food_bank_claims
           WHERE donation_id = ? AND status NOT IN ('Cancelled', 'Rejected')), 0) AS reserved`,
      [donation_id, donation_id]
    );
    const totalQuantity = parseInt(donations[0].quantity, 10) || 0;
    const availablePortions = Math.max(0, totalQuantity - (parseInt(reserved[0]?.reserved, 10) || 0));
    if (availablePortions <= 0) {
      return res.status(409).json({ success: false, message: "No remaining portions are available for this donation." });
    }

    const [result] = await pool.query(
      `INSERT INTO food_bank_claims
       (food_bank_id, donation_id, requested_portions, fulfillment_method,
        pickup_location, additional_notes, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        req.user.id,
        donation_id,
        availablePortions,
        fulfillment_method,
        pickup_location.trim(),
        additional_notes?.trim() || null,
      ]
    );

    const [claim] = await pool.query("SELECT * FROM food_bank_claims WHERE id = ?", [result.insertId]);
    return res.status(201).json({
      success: true,
      message: fulfillment_method === "Self Pickup"
        ? "Self-pickup claim saved successfully."
        : "Donation claim saved and driver dispatch requested.",
      claim: claim[0],
    });
  } catch (error) {
    console.error("create food bank claim error:", error);
    return res.status(500).json({ success: false, message: "Server error creating claim.", error: error.message });
  }
};

exports.getClaimHistory = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }
  if (String(req.user.role).toUpperCase() !== "FOOD_BANK") {
    return res.status(403).json({ success: false, message: "Only food banks can view claim history." });
  }

  try {
    await foodBankClaimsTableReady;
    let claims;
    try {
      [claims] = await pool.query(
        `SELECT fbc.*, d.meal_name, d.image_url, d.location AS donor_location,
                d.expiry_window, d.quantity, d.quantity_unit,
                COALESCE(NULLIF(fi.name, ''), d.meal_name) AS display_meal_name
         FROM food_bank_claims fbc
         INNER JOIN donations d ON d.id = fbc.donation_id
         LEFT JOIN food_items fi ON d.food_item_id = fi.id
         WHERE fbc.food_bank_id = ?
         ORDER BY fbc.created_at DESC`,
        [req.user.id]
      );
    } catch (queryError) {
      // Older databases may not have quantity_unit or food_item_id yet.
      if (!["ER_BAD_FIELD_ERROR", "ER_NO_SUCH_TABLE"].includes(queryError.code)) {
        throw queryError;
      }
      [claims] = await pool.query(
        `SELECT fbc.*, d.meal_name, d.image_url, d.location AS donor_location,
                d.expiry_window, d.quantity,
                d.meal_name AS display_meal_name
         FROM food_bank_claims fbc
         INNER JOIN donations d ON d.id = fbc.donation_id
         WHERE fbc.food_bank_id = ?
         ORDER BY fbc.created_at DESC`,
        [req.user.id]
      );
    }
    return res.json({ success: true, count: claims.length, claims });
  } catch (error) {
    console.error("get food bank claim history error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching claim history.", error: error.message });
  }
};
