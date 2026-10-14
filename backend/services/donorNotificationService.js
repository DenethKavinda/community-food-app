const pool = require("../config/db");

// Auto-ensure event_type, reference_id, and UNIQUE constraint exist on notifications table
const ensureNotificationSchema = async () => {
  try {
    const [eventCols] = await pool.query("SHOW COLUMNS FROM notifications LIKE 'event_type'");
    if (eventCols.length === 0) {
      await pool.query("ALTER TABLE notifications ADD COLUMN event_type VARCHAR(50) NULL AFTER message");
    }

    const [refCols] = await pool.query("SHOW COLUMNS FROM notifications LIKE 'reference_id'");
    if (refCols.length === 0) {
      await pool.query("ALTER TABLE notifications ADD COLUMN reference_id VARCHAR(100) NULL AFTER event_type");
    }

    const [indexes] = await pool.query("SHOW INDEX FROM notifications WHERE Key_name = 'uk_donor_notif_event'");
    if (indexes.length === 0) {
      await pool.query(
        "ALTER TABLE notifications ADD CONSTRAINT uk_donor_notif_event UNIQUE (recipient_id, donation_id, event_type, reference_id)"
      );
    }
  } catch (err) {
    console.warn("Notification schema auto-ensure note:", err.message);
  }
};

ensureNotificationSchema();

// Helper to parse donation expiry date using original created_at
function getParsedExpiryDate(expiryWindowStr, createdAtStr) {
  if (!expiryWindowStr) return null;
  const str = String(expiryWindowStr).trim();
  const now = new Date();

  let baseDate = now;
  if (createdAtStr) {
    const parsedBase = createdAtStr instanceof Date ? createdAtStr : new Date(createdAtStr);
    if (!isNaN(parsedBase.getTime())) {
      baseDate = parsedBase;
    }
  }

  let targetDate = new Date(baseDate);

  const lower = str.toLowerCase();
  if (lower.startsWith("today")) {
    targetDate = new Date(baseDate);
  } else if (lower.startsWith("yesterday")) {
    targetDate = new Date(baseDate);
    targetDate.setDate(targetDate.getDate() - 1);
  } else if (lower.startsWith("tomorrow")) {
    targetDate = new Date(baseDate);
    targetDate.setDate(targetDate.getDate() + 1);
  } else if (lower.startsWith("in 2 days")) {
    targetDate = new Date(baseDate);
    targetDate.setDate(targetDate.getDate() + 2);
  } else {
    // Custom calendar date like "Oct 10, 09:00 PM"
    const datePart = str.split(",")[0].trim();
    const withYear = `${datePart} ${baseDate.getFullYear()}`;
    const parsed = new Date(withYear);
    if (!isNaN(parsed.getTime())) {
      targetDate = parsed;
    } else {
      const fullParsed = new Date(str);
      if (!isNaN(fullParsed.getTime())) {
        targetDate = fullParsed;
      } else {
        return null;
      }
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
  } else {
    // No time component — treat end of day as expiry
    targetDate.setHours(23, 59, 59, 999);
  }

  return targetDate;
}

function isExpiryPassed(expiryWindowStr, createdAtStr) {
  const targetDate = getParsedExpiryDate(expiryWindowStr, createdAtStr);
  if (!targetDate) return false;
  return targetDate < new Date();
}

// ── Generic Idempotent Notification Inserter ──
async function insertNotification({ recipient_id, donation_id, title, message, event_type, reference_id }) {
  if (!recipient_id || !donation_id || !title || !message) return null;

  try {
    const [result] = await pool.query(
      `INSERT INTO notifications (recipient_id, donation_id, title, message, event_type, reference_id, is_read)
       VALUES (?, ?, ?, ?, ?, ?, FALSE)
       ON DUPLICATE KEY UPDATE id = id`,
      [recipient_id, donation_id, title, message, event_type || null, reference_id || null]
    );

    return result;
  } catch (error) {
    // ER_DUP_ENTRY (1062) handling for duplicate constraint
    if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
      console.log(`[Notification Duplicate Suppressed] Event: ${event_type}, Ref: ${reference_id}`);
      return null;
    }
    console.error("Insert notification error:", error.message);
    return null;
  }
}

// ── Event Trigger 1: Donation Claimed ──
async function notifyClaimCreated({ donor_id, donation_id, meal_name, claim_reference }) {
  const title = "Donation Claimed";
  const message = `Your donation '${meal_name || "Food Item"}' has been claimed.`;
  const event_type = "CLAIM_CREATED";
  const reference_id = claim_reference || `claim-${Date.now()}`;

  return await insertNotification({
    recipient_id: donor_id,
    donation_id,
    title,
    message,
    event_type,
    reference_id,
  });
}

// ── Event Trigger 2: Donation Claim Cancelled ──
async function notifyClaimCancelled({ donor_id, donation_id, meal_name, claim_reference }) {
  const title = "Donation Claim Cancelled";
  const message = `The claim on your donation '${meal_name || "Food Item"}' has been cancelled.`;
  const event_type = "CLAIM_CANCELLED";
  const reference_id = claim_reference ? `${claim_reference}-cancelled` : `cancel-${Date.now()}`;

  return await insertNotification({
    recipient_id: donor_id,
    donation_id,
    title,
    message,
    event_type,
    reference_id,
  });
}

// ── Event Trigger 3: Donation Expired ──
async function notifyDonationExpired({ donor_id, donation_id, meal_name }) {
  const title = "Donation Expired";
  const message = `Your donation '${meal_name || "Food Item"}' has expired.`;
  const event_type = "DONATION_EXPIRED";
  const reference_id = "expiry";

  return await insertNotification({
    recipient_id: donor_id,
    donation_id,
    title,
    message,
    event_type,
    reference_id,
  });
}

// ── Background Expiry Scanning Function ──
async function checkAndNotifyExpiredDonations() {
  try {
    await ensureNotificationSchema();

    // Fetch active/pending donations that might have expired
    const [donations] = await pool.query(
      "SELECT id, donor_id, meal_name, expiry_window, created_at, status FROM donations WHERE status IN ('Pending', 'Active')"
    );

    for (const d of donations) {
      if (isExpiryPassed(d.expiry_window, d.created_at)) {
        // Soft-update status to Expired
        try {
          await pool.query("UPDATE donations SET status = 'Expired' WHERE id = ? AND status IN ('Pending', 'Active')", [d.id]);
        } catch (updateErr) {
          console.warn(`Could not update donation #${d.id} status to Expired:`, updateErr.message);
        }

        // Persist notification for donor
        await notifyDonationExpired({
          donor_id: d.donor_id,
          donation_id: d.id,
          meal_name: d.meal_name,
        });
      }
    }
  } catch (error) {
    console.error("Expired donations background check error:", error.message);
  }
}

module.exports = {
  isExpiryPassed,
  insertNotification,
  notifyClaimCreated,
  notifyClaimCancelled,
  notifyDonationExpired,
  checkAndNotifyExpiredDonations,
};
