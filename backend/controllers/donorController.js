const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

// Ensure upload directory exists
const uploadsDir = path.join(__dirname, "../uploads/donations");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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

// Auto-ensure latitude and longitude columns exist in donations table
const ensureDonationLocationColumns = async () => {
  try {
    const [latCols] = await pool.query("SHOW COLUMNS FROM donations LIKE 'latitude'");
    if (latCols.length === 0) {
      await pool.query("ALTER TABLE donations ADD COLUMN latitude DECIMAL(10, 8) NULL AFTER location");
    }
    const [lngCols] = await pool.query("SHOW COLUMNS FROM donations LIKE 'longitude'");
    if (lngCols.length === 0) {
      await pool.query("ALTER TABLE donations ADD COLUMN longitude DECIMAL(11, 8) NULL AFTER latitude");
    }
  } catch (err) {
    console.warn("Donations location columns setup warning:", err.message);
  }
};
ensureDonationLocationColumns();

// 1. CREATE NEW FOOD DONATION
exports.createDonation = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Authentication required. Please log in." });
  }

  const { food_item_id, meal_name, quantity, quantity_unit, location, latitude, longitude, expiry_window, notes, image_base64, image_url } = req.body;
  const donor_id = req.user.id;

  let parsedLat = latitude !== undefined && latitude !== null && !isNaN(Number(latitude)) ? parseFloat(latitude) : null;
  let parsedLng = longitude !== undefined && longitude !== null && !isNaN(Number(longitude)) ? parseFloat(longitude) : null;

  let finalMealName = meal_name ? meal_name.trim() : "";
  let validFoodItemId = food_item_id ? parseInt(food_item_id) : null;

  // Validate numeric quantity > 0
  const numericQty = parseFloat(quantity);
  if (isNaN(numericQty) || numericQty <= 0) {
    return res.status(400).json({
      message: "Please enter a valid numeric quantity greater than 0.",
    });
  }

  const finalQuantityUnit = quantity_unit ? quantity_unit.trim().toLowerCase() : "items";

  // If food_item_id is provided, try to fetch the item's name if meal_name is empty
  if (validFoodItemId && !finalMealName) {
    try {
      const [foodItems] = await pool.query("SELECT name FROM food_items WHERE id = ?", [validFoodItemId]);
      if (foodItems.length > 0) {
        finalMealName = foodItems[0].name;
      }
    } catch (err) {
      console.warn("Could not fetch food item name:", err.message);
    }
  }

  if (!finalMealName || !quantity || !location || !expiry_window) {
    return res.status(400).json({
      message: "Please fill in all required fields (Meal Name/Food Item, Quantity, Location, Expiry Window).",
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

    // If no image provided, keep savedImageUrl as null
    if (!savedImageUrl) {
      savedImageUrl = null;
    }

    let result;
    const statusToUse = "Pending";

    try {
      [result] = await pool.query(
        `INSERT INTO donations (donor_id, food_item_id, meal_name, quantity, quantity_unit, location, latitude, longitude, expiry_window, notes, image_url, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [donor_id, validFoodItemId, finalMealName, String(numericQty), finalQuantityUnit, location, parsedLat, parsedLng, expiry_window, notes || null, savedImageUrl, statusToUse]
      );
    } catch (dbErr) {
      console.warn("DB Query attempt 1 note:", dbErr.message);

      // Handle status ENUM truncation error (errno 1265 / WARN_DATA_TRUNCATED)
      if (dbErr.errno === 1265 || dbErr.code === "WARN_DATA_TRUNCATED") {
        try {
          await pool.query("ALTER TABLE donations MODIFY COLUMN status VARCHAR(50) DEFAULT 'Pending'");
          [result] = await pool.query(
            `INSERT INTO donations (donor_id, food_item_id, meal_name, quantity, quantity_unit, location, latitude, longitude, expiry_window, notes, image_url, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
            [donor_id, validFoodItemId, finalMealName, String(numericQty), finalQuantityUnit, location, parsedLat, parsedLng, expiry_window, notes || null, savedImageUrl]
          );
        } catch (alterErr) {
          console.warn("Could not alter status column, falling back to 'Active':", alterErr.message);
          [result] = await pool.query(
            `INSERT INTO donations (donor_id, food_item_id, meal_name, quantity, quantity_unit, location, latitude, longitude, expiry_window, notes, image_url, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
            [donor_id, validFoodItemId, finalMealName, String(numericQty), finalQuantityUnit, location, parsedLat, parsedLng, expiry_window, notes || null, savedImageUrl]
          );
        }
      } else if (dbErr.errno === 1054 || dbErr.code === "ER_BAD_FIELD_ERROR") {
        try {
          await pool.query("ALTER TABLE donations ADD COLUMN quantity_unit VARCHAR(50) DEFAULT 'items'");
          [result] = await pool.query(
            `INSERT INTO donations (donor_id, food_item_id, meal_name, quantity, quantity_unit, location, latitude, longitude, expiry_window, notes, image_url, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [donor_id, validFoodItemId, finalMealName, String(numericQty), finalQuantityUnit, location, parsedLat, parsedLng, expiry_window, notes || null, savedImageUrl, statusToUse]
          );
        } catch (alterErr) {
          console.warn("Could not add quantity_unit column, falling back without column:", alterErr.message);
          const combinedQty = `${numericQty} ${finalQuantityUnit}`;
          [result] = await pool.query(
            `INSERT INTO donations (donor_id, food_item_id, meal_name, quantity, location, latitude, longitude, expiry_window, notes, image_url, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
            [donor_id, validFoodItemId, finalMealName, combinedQty, location, parsedLat, parsedLng, expiry_window, notes || null, savedImageUrl]
          );
        }
      } else {
        // Fallback query if quantity_unit column is not added yet in MySQL
        const combinedQty = `${numericQty} ${finalQuantityUnit}`;
        try {
          [result] = await pool.query(
            `INSERT INTO donations (donor_id, food_item_id, meal_name, quantity, location, latitude, longitude, expiry_window, notes, image_url, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
            [donor_id, validFoodItemId, finalMealName, combinedQty, location, parsedLat, parsedLng, expiry_window, notes || null, savedImageUrl]
          );
        } catch (err2) {
          if (err2.errno === 1265 || err2.code === "WARN_DATA_TRUNCATED") {
            try {
              await pool.query("ALTER TABLE donations MODIFY COLUMN status VARCHAR(50) DEFAULT 'Pending'");
            } catch (e) {}
            [result] = await pool.query(
              `INSERT INTO donations (donor_id, food_item_id, meal_name, quantity, location, latitude, longitude, expiry_window, notes, image_url, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
              [donor_id, validFoodItemId, finalMealName, combinedQty, location, parsedLat, parsedLng, expiry_window, notes || null, savedImageUrl]
            );
          } else {
            throw err2;
          }
        }
      }
    }

    const [newDonation] = await pool.query("SELECT * FROM donations WHERE id = ?", [result.insertId]);

    // Create notifications for all recipients (fire and forget)
    try {
      const [recipients] = await pool.query(
        "SELECT id FROM users WHERE UPPER(role) IN ('RECIPIENT', 'FOOD_BANK')"
      );
      if (recipients.length > 0) {
        const d = newDonation[0];
        const title = "New Food Donation Available";
        const message = `${d.meal_name} - ${d.quantity} available`;
        
        const values = recipients.map(r => [r.id, d.id, title, message]);
        await pool.query(
          "INSERT INTO notifications (recipient_id, donation_id, title, message) VALUES ?",
          [values]
        );
      }
    } catch (notifErr) {
      console.warn("Could not create notifications:", notifErr.message);
    }

    res.status(201).json({
      message: "Donation post created successfully!",
      donation: newDonation[0],
    });
  } catch (error) {
    console.error("Create donation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper function to check if donation expiry date has passed
function isExpiryPassed(expiryWindowStr, createdAtStr) {
  if (!expiryWindowStr) return false;
  const str = expiryWindowStr.trim();
  const now = new Date();

  let targetDate = new Date();

  if (str.toLowerCase().startsWith("today")) {
    targetDate = new Date();
  } else if (str.toLowerCase().startsWith("yesterday")) {
    return true; // Yesterday is always in the past
  } else if (str.toLowerCase().startsWith("tomorrow")) {
    targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1);
  } else if (str.toLowerCase().startsWith("in 2 days")) {
    targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);
  } else {
    // Custom calendar date like "Oct 10, 09:00 PM"
    // Extract the date part (before the comma) and append current year
    const datePart = str.split(",")[0].trim();
    const withYear = `${datePart} ${now.getFullYear()}`;
    const parsed = new Date(withYear);
    if (!isNaN(parsed.getTime())) {
      targetDate = parsed;
    } else {
      // Full direct fallback
      const fullParsed = new Date(str);
      if (!isNaN(fullParsed.getTime())) {
        return fullParsed < now;
      }
      return false;
    }
  }

  // Extract time portion e.g. "05:00 PM" or "17:00"
  const timeMatch = str.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : null;

    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    targetDate.setHours(hours, minutes, 0, 0);
    return targetDate < now;
  }

  // No time component found — treat end of day as expiry
  targetDate.setHours(23, 59, 59, 999);
  return targetDate < now;
}

// 2. GET DONATIONS (Logged-in Donor History or All Posts)
exports.getDonorDonations = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Authentication required. Please log in." });
  }

  const donor_id = req.user.id;
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

    // Auto-update expired Pending donations
    for (let d of donations) {
      if (d.status === "Pending" && isExpiryPassed(d.expiry_window, d.created_at)) {
        d.status = "Expired";
        try {
          await pool.query("UPDATE donations SET status = 'Expired' WHERE id = ?", [d.id]);
        } catch (e) {
          console.warn(`Could not update donation ${d.id} to Expired:`, e.message);
        }
      }
    }

    // Aggregate reserved portions across recipient requests & food bank claims
    const [requests] = await pool.query(
      "SELECT donation_id, SUM(requested_portions) as reserved FROM requests WHERE status NOT IN ('Cancelled') GROUP BY donation_id"
    );
    const [foodBankClaims] = await pool.query(
      `SELECT donation_id, SUM(requested_portions) AS reserved
       FROM food_bank_claims
       WHERE status NOT IN ('Cancelled', 'Rejected')
       GROUP BY donation_id`
    );

    const reservedMap = {};
    requests.forEach((r) => {
      reservedMap[r.donation_id] = parseInt(r.reserved) || 0;
    });
    foodBankClaims.forEach((r) => {
      reservedMap[r.donation_id] = (reservedMap[r.donation_id] || 0) + (parseInt(r.reserved) || 0);
    });

    const enrichedDonations = donations.map((d) => {
      const origQty = parseInt(d.quantity) || 0;
      const resQty = reservedMap[d.id] || 0;
      const availQty = Math.max(0, origQty - resQty);

      return {
        ...d,
        original_quantity: origQty,
        reserved_quantity: resQty,
        available_quantity: availQty,
      };
    });

    res.json({
      success: true,
      count: enrichedDonations.length,
      donations: enrichedDonations,
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

    const d = donations[0];
    if (d.status === "Pending" && isExpiryPassed(d.expiry_window, d.created_at)) {
      d.status = "Expired";
      try {
        await pool.query("UPDATE donations SET status = 'Expired' WHERE id = ?", [d.id]);
      } catch (e) {}
    }

    const [requests] = await pool.query(
      "SELECT SUM(requested_portions) as reserved FROM requests WHERE donation_id = ? AND status NOT IN ('Cancelled')",
      [d.id]
    );
    const [foodBankClaims] = await pool.query(
      "SELECT SUM(requested_portions) as reserved FROM food_bank_claims WHERE donation_id = ? AND status NOT IN ('Cancelled', 'Rejected')",
      [d.id]
    );

    const reqReserved = parseInt(requests[0]?.reserved) || 0;
    const claimReserved = parseInt(foodBankClaims[0]?.reserved) || 0;
    const totalReserved = reqReserved + claimReserved;
    const origQty = parseInt(d.quantity) || 0;
    const availQty = Math.max(0, origQty - totalReserved);

    d.original_quantity = origQty;
    d.reserved_quantity = totalReserved;
    d.available_quantity = availQty;

    res.json({ success: true, donation: d });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 4. UPDATE DONATION STATUS
exports.updateDonationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["Pending", "Active", "Picked Up", "Completed", "Cancelled", "Expired"];
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

// 4.5. UPDATE DONATION DETAILS (Donor Only)
exports.updateDonation = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  const { id } = req.params;
  const donor_id = req.user.id;
  const { meal_name, quantity, quantity_unit, location, latitude, longitude, expiry_window, notes, image_base64, image_url } = req.body;

  try {
    const [existing] = await pool.query(
      "SELECT * FROM donations WHERE id = ? AND donor_id = ?",
      [id, donor_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Donation post not found or access denied." });
    }

    const current = existing[0];

    let finalMealName = meal_name ? meal_name.trim() : current.meal_name;
    let numericQty = quantity !== undefined && quantity !== null && String(quantity).trim() !== "" ? parseFloat(quantity) : parseFloat(current.quantity);
    if (isNaN(numericQty) || numericQty <= 0) {
      return res.status(400).json({ success: false, message: "Quantity must be a number greater than 0." });
    }

    let finalUnit = quantity_unit ? quantity_unit.trim().toLowerCase() : (current.quantity_unit || "items");
    let finalLocation = location ? location.trim() : current.location;
    let finalExpiry = expiry_window ? expiry_window.trim() : current.expiry_window;
    let finalNotes = notes !== undefined ? notes.trim() : current.notes;
    let parsedLat = latitude !== undefined && latitude !== null && !isNaN(Number(latitude)) ? parseFloat(latitude) : current.latitude;
    let parsedLng = longitude !== undefined && longitude !== null && !isNaN(Number(longitude)) ? parseFloat(longitude) : current.longitude;

    let savedImageUrl = current.image_url;
    if (image_url !== undefined) {
      savedImageUrl = image_url;
    } else if (image_base64) {
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
      } catch (e) {
        console.warn("Base64 save error during update:", e.message);
      }
    }

    try {
      await pool.query(
        `UPDATE donations 
         SET meal_name = ?, quantity = ?, quantity_unit = ?, location = ?, latitude = ?, longitude = ?, expiry_window = ?, notes = ?, image_url = ?
         WHERE id = ? AND donor_id = ?`,
        [finalMealName, String(numericQty), finalUnit, finalLocation, parsedLat, parsedLng, finalExpiry, finalNotes || null, savedImageUrl, id, donor_id]
      );
    } catch (dbErr) {
      if (dbErr.errno === 1054 || dbErr.code === "ER_BAD_FIELD_ERROR") {
        console.warn("quantity_unit column missing in donations table, attempting ALTER TABLE...");
        try {
          await pool.query("ALTER TABLE donations ADD COLUMN quantity_unit VARCHAR(50) DEFAULT 'items'");
          await pool.query(
            `UPDATE donations 
             SET meal_name = ?, quantity = ?, quantity_unit = ?, location = ?, latitude = ?, longitude = ?, expiry_window = ?, notes = ?, image_url = ?
             WHERE id = ? AND donor_id = ?`,
            [finalMealName, String(numericQty), finalUnit, finalLocation, parsedLat, parsedLng, finalExpiry, finalNotes || null, savedImageUrl, id, donor_id]
          );
        } catch (alterErr) {
          console.warn("Could not add quantity_unit column, updating without it:", alterErr.message);
          await pool.query(
            `UPDATE donations 
             SET meal_name = ?, quantity = ?, location = ?, latitude = ?, longitude = ?, expiry_window = ?, notes = ?, image_url = ?
             WHERE id = ? AND donor_id = ?`,
            [finalMealName, String(numericQty), finalLocation, parsedLat, parsedLng, finalExpiry, finalNotes || null, savedImageUrl, id, donor_id]
          );
        }
      } else {
        throw dbErr;
      }
    }

    const [updated] = await pool.query("SELECT * FROM donations WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Donation updated successfully.",
      donation: updated[0],
    });
  } catch (error) {
    console.error("updateDonation error:", error);
    res.status(500).json({ success: false, message: "Server error updating donation", error: error.message });
  }
};

// 5. DELETE DONATION
exports.deleteDonation = async (req, res) => {
  const { id } = req.params;
  const donor_id = req.user ? req.user.id : null;

  try {
    // Delete dependent references first if any to avoid foreign key issues
    await pool.query("DELETE FROM notifications WHERE donation_id = ?", [id]).catch(() => {});
    await pool.query("DELETE FROM requests WHERE donation_id = ?", [id]).catch(() => {});
    await pool.query("DELETE FROM food_bank_claims WHERE donation_id = ?", [id]).catch(() => {});
    await pool.query("DELETE FROM driver_tasks WHERE donation_id = ?", [id]).catch(() => {});

    let result;
    if (donor_id) {
      [result] = await pool.query("DELETE FROM donations WHERE id = ? AND donor_id = ?", [id, donor_id]);
    } else {
      [result] = await pool.query("DELETE FROM donations WHERE id = ?", [id]);
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Donation item not found." });
    }

    res.json({ message: "Donation post deleted successfully." });
  } catch (error) {
    console.error("Delete donation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 6. GET AVAILABLE DONATIONS (Recipient Dashboard — Pending or Active)
exports.getAvailableDonations = async (req, res) => {
  try {
    await foodBankClaimsTableReady;
    const [donations] = await pool.query(
      `SELECT d.*,
              COALESCE(NULLIF(fi.name, ''), d.meal_name) AS display_meal_name,
              fi.category
       FROM donations d
       LEFT JOIN food_items fi ON d.food_item_id = fi.id
       WHERE d.status IN ('Pending', 'Active')
       ORDER BY d.created_at DESC`
    );

    // Recipient requests and food-bank claims both reserve from the same donation balance.
    const [requests] = await pool.query(
      "SELECT donation_id, SUM(requested_portions) as reserved FROM requests WHERE status NOT IN ('Cancelled') GROUP BY donation_id"
    );
    const [foodBankClaims] = await pool.query(
      `SELECT donation_id, SUM(requested_portions) AS reserved
       FROM food_bank_claims
       WHERE status NOT IN ('Cancelled', 'Rejected')
       GROUP BY donation_id`
    );

    const reservedMap = {};
    requests.forEach(r => {
      reservedMap[r.donation_id] = parseInt(r.reserved) || 0;
    });
    foodBankClaims.forEach(r => {
      reservedMap[r.donation_id] = (reservedMap[r.donation_id] || 0) + (parseInt(r.reserved) || 0);
    });

    const enrichedDonations = donations.map(d => {
      const originalQuantity = parseInt(d.quantity) || 0;
      const reserved = reservedMap[d.id] || 0;
      const available_portions = Math.max(0, originalQuantity - reserved);
      
      return {
        ...d,
        available_portions,
        category: d.category || null,
      };
    }).filter(d => d.available_portions > 0);

    res.json({
      success: true,
      count: enrichedDonations.length,
      donations: enrichedDonations,
    });
  } catch (error) {
    console.error("Get available donations error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// 7. GET DONOR STATISTICS
exports.getDonorStats = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  const donor_id = req.user.id;

  try {
    // 1. Total Donations count
    const [totalRes] = await pool.query(
      "SELECT COUNT(*) AS totalDonations FROM donations WHERE donor_id = ?",
      [donor_id]
    );

    // 2. Total Quantity / Portions Given
    const [quantityRes] = await pool.query(
      "SELECT SUM(CAST(quantity AS DECIMAL(10,2))) AS totalQuantity FROM donations WHERE donor_id = ?",
      [donor_id]
    );

    // 3. Completed Donations count
    const [completedRes] = await pool.query(
      "SELECT COUNT(*) AS completedDonations FROM donations WHERE donor_id = ? AND status = 'Completed'",
      [donor_id]
    );

    // 4. Pickups Done / In Progress
    const [pickupsRes] = await pool.query(
      "SELECT COUNT(*) AS pickupsDone FROM donations WHERE donor_id = ? AND status IN ('Picked Up', 'Completed')",
      [donor_id]
    );

    const totalDonations = parseInt(totalRes[0]?.totalDonations) || 0;
    const totalQuantity = parseFloat(quantityRes[0]?.totalQuantity) || 0;
    const completedDonations = parseInt(completedRes[0]?.completedDonations) || 0;
    const pickupsDone = parseInt(pickupsRes[0]?.pickupsDone) || 0;

    res.json({
      success: true,
      stats: {
        totalDonations,
        totalQuantity,
        completedDonations,
        pickupsDone,
      },
    });
  } catch (error) {
    console.error("getDonorStats error:", error);
    res.status(500).json({ success: false, message: "Server error fetching stats", error: error.message });
  }
};

// 8. GET DONOR NOTIFICATIONS (Strictly Authenticated User ID)
exports.getNotifications = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  const donorId = req.user.id;

  try {
    // Run automated expiration check
    const { checkAndNotifyExpiredDonations } = require("../services/donorNotificationService");
    await checkAndNotifyExpiredDonations();

    const [notifications] = await pool.query(
      "SELECT * FROM notifications WHERE recipient_id = ? ORDER BY created_at DESC LIMIT 100",
      [donorId]
    );

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error("getNotifications error:", error);
    res.status(500).json({ success: false, message: "Server error fetching notifications", error: error.message });
  }
};

// 9. MARK SINGLE NOTIFICATION AS READ
exports.markAsRead = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  const donorId = req.user.id;
  const notificationId = req.params.id;

  try {
    const [result] = await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE id = ? AND recipient_id = ?",
      [notificationId, donorId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Notification not found or access denied." });
    }

    res.json({ success: true, message: "Notification marked as read." });
  } catch (error) {
    console.error("markAsRead error:", error);
    res.status(500).json({ success: false, message: "Server error updating notification", error: error.message });
  }
};

// 10. MARK ALL NOTIFICATIONS AS READ
exports.markAllAsRead = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  const donorId = req.user.id;

  try {
    await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE recipient_id = ?",
      [donorId]
    );

    res.json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    console.error("markAllAsRead error:", error);
    res.status(500).json({ success: false, message: "Server error updating notifications", error: error.message });
  }
};
