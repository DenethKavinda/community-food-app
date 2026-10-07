const pool = require("../config/db");

const inventoryTableReady = pool.query(`
  CREATE TABLE IF NOT EXISTS food_bank_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    food_bank_id INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    quantity_unit VARCHAR(50) NOT NULL DEFAULT 'items',
    expiry_at DATETIME NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (food_bank_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

function toMysqlDatetime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function parseExpiry(value, createdAt) {
  if (!value) return null;
  const raw = String(value).trim();
  const base = createdAt ? new Date(createdAt) : new Date();
  const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) {
    const date = new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]), 23, 59, 59);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const relative = raw.match(/^(Today|Tomorrow|Yesterday),?\s*(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!relative) return null;
  const date = new Date(base);
  const dayOffset = relative[1].toLowerCase() === "tomorrow" ? 1 : relative[1].toLowerCase() === "yesterday" ? -1 : 0;
  date.setDate(date.getDate() + dayOffset);
  let hour = Number(relative[2]);
  if (relative[4].toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (relative[4].toUpperCase() === "AM" && hour === 12) hour = 0;
  date.setHours(hour, Number(relative[3]), 0, 0);
  return date;
}

function enrich(item) {
  const expiryDate = item.expiry_at
    ? new Date(item.expiry_at)
    : parseExpiry(item.expiry_window, item.created_at);
  const now = new Date();
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  let expiry_status = "unknown";
  if (expiryDate && !Number.isNaN(expiryDate.getTime())) {
    expiry_status = expiryDate < now ? "expired" : expiryDate <= twoDaysFromNow ? "expiring_soon" : "fresh";
  }
  return {
    ...item,
    quantity: Number(item.quantity) || 0,
    expiry_at: expiryDate && !Number.isNaN(expiryDate.getTime()) ? expiryDate.toISOString() : null,
    expiry_status,
  };
}

exports.getInventory = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }
  try {
    await inventoryTableReady;
    const [manualItems] = await pool.query(
      `SELECT id, item_name, category, quantity, quantity_unit, expiry_at, notes,
              created_at, 'manual' AS source_type
       FROM food_bank_inventory
       WHERE food_bank_id = ?
       ORDER BY COALESCE(expiry_at, '9999-12-31') ASC, created_at DESC`,
      [req.user.id]
    );
    let claimedItems;
    try {
      [claimedItems] = await pool.query(
        `SELECT CONCAT('claim-', fbc.id) AS id,
                COALESCE(NULLIF(fi.name, ''), d.meal_name) AS item_name,
                fi.category,
                fbc.requested_portions AS quantity,
                d.quantity_unit,
                d.expiry_window,
                d.created_at,
                d.image_url,
                fbc.created_at AS claimed_at,
                'donation' AS source_type
         FROM food_bank_claims fbc
         INNER JOIN donations d ON d.id = fbc.donation_id
         LEFT JOIN food_items fi ON fi.id = d.food_item_id
         WHERE fbc.food_bank_id = ?
           AND fbc.status NOT IN ('Cancelled', 'Rejected')
         ORDER BY fbc.created_at DESC`,
        [req.user.id]
      );
    } catch (error) {
      if (!["ER_BAD_FIELD_ERROR", "ER_NO_SUCH_TABLE"].includes(error.code)) {
        throw error;
      }
      [claimedItems] = await pool.query(
        `SELECT CONCAT('claim-', fbc.id) AS id,
                d.meal_name AS item_name,
                NULL AS category,
                fbc.requested_portions AS quantity,
                'portions' AS quantity_unit,
                d.expiry_window,
                d.created_at,
                d.image_url,
                fbc.created_at AS claimed_at,
                'donation' AS source_type
         FROM food_bank_claims fbc
         INNER JOIN donations d ON d.id = fbc.donation_id
         WHERE fbc.food_bank_id = ?
           AND fbc.status NOT IN ('Cancelled', 'Rejected')
         ORDER BY fbc.created_at DESC`,
        [req.user.id]
      );
    }
    const items = [...manualItems, ...claimedItems].map(enrich);
    res.json({
      success: true,
      count: items.length,
      summary: {
        total_items: items.length,
        expired: items.filter((item) => item.expiry_status === "expired").length,
        expiring_soon: items.filter((item) => item.expiry_status === "expiring_soon").length,
      },
      items,
    });
  } catch (error) {
    console.error("Get food bank inventory error:", error);
    res.status(500).json({ success: false, message: "Server error fetching inventory.", error: error.message });
  }
};

exports.createInventoryItem = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }
  const { item_name, category, quantity, quantity_unit, expiry_at, notes } = req.body;
  const numericQuantity = Number(quantity);
  if (!item_name || !String(item_name).trim() || !Number.isFinite(numericQuantity) || numericQuantity <= 0) {
    return res.status(400).json({ success: false, message: "Item name and a positive quantity are required." });
  }
  if (expiry_at && Number.isNaN(new Date(expiry_at).getTime())) {
    return res.status(400).json({ success: false, message: "Expiry date and time is invalid." });
  }
  const mysqlExpiryAt = toMysqlDatetime(expiry_at);
  try {
    await inventoryTableReady;
    const [result] = await pool.query(
      `INSERT INTO food_bank_inventory
       (food_bank_id, item_name, category, quantity, quantity_unit, expiry_at, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        String(item_name).trim(),
        category ? String(category).trim() : null,
        numericQuantity,
        quantity_unit ? String(quantity_unit).trim() : "items",
        mysqlExpiryAt,
        notes ? String(notes).trim() : null,
      ]
    );
    const [rows] = await pool.query(
      "SELECT id, item_name, category, quantity, quantity_unit, expiry_at, notes, created_at, 'manual' AS source_type FROM food_bank_inventory WHERE id = ?",
      [result.insertId]
    );
    res.status(201).json({ success: true, item: enrich(rows[0]) });
  } catch (error) {
    console.error("Create food bank inventory item error:", error);
    res.status(500).json({ success: false, message: "Server error saving inventory item.", error: error.message });
  }
};

exports.deleteInventoryItem = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }
  try {
    await inventoryTableReady;
    const [result] = await pool.query(
      "DELETE FROM food_bank_inventory WHERE id = ? AND food_bank_id = ?",
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Inventory item not found." });
    res.json({ success: true, message: "Inventory item removed." });
  } catch (error) {
    console.error("Delete food bank inventory item error:", error);
    res.status(500).json({ success: false, message: "Server error removing inventory item.", error: error.message });
  }
};
