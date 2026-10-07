const pool = require("../config/db");

// GET /api/recipient/notifications
exports.getNotifications = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const [notifications] = await pool.query(
      "SELECT * FROM notifications WHERE recipient_id = ? ORDER BY created_at DESC LIMIT 50",
      [req.user.id]
    );

    res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PATCH /api/recipient/notifications/:id/read
exports.markAsRead = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const notificationId = req.params.id;

  try {
    await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE id = ? AND recipient_id = ?",
      [notificationId, req.user.id]
    );

    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PATCH /api/recipient/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE recipient_id = ?",
      [req.user.id]
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
