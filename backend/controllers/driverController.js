const db = require("../config/db");

// =====================================================
// GET DRIVER DELIVERY TASKS
// Food Bank claims + Recipient requests
// =====================================================

const getDriverPickups = async (req, res) => {
  try {
    const [foodBankTasks] = await db.query(`
      SELECT
        d.id AS donation_id,
        d.donor_id,

        d.meal_name,
        d.quantity,
        d.quantity_unit,
        d.expiry_window,
        d.notes,
        d.image_url,
        d.status AS donation_status,
        d.created_at,

        u.name AS donor_name,
        u.phone AS donor_phone,
        u.latitude AS pickup_latitude,
        u.longitude AS pickup_longitude,
        d.location AS pickup_address,

        fbc.id AS claim_id,
        'FOOD_BANK' AS task_type,
        fbc.fulfillment_method,
        fbc.pickup_location AS destination_address,

        bank.latitude AS destination_latitude,
        bank.longitude AS destination_longitude

      FROM food_bank_claims fbc

      INNER JOIN donations d
        ON d.id = fbc.donation_id

      INNER JOIN users u
        ON d.donor_id = u.id

      INNER JOIN users bank
        ON fbc.food_bank_id = bank.id

      WHERE fbc.fulfillment_method = 'Volunteer Driver Delivery'
        AND fbc.status NOT IN ('Cancelled', 'Rejected', 'Completed')
        AND d.status IN ('Pending', 'Active')

      ORDER BY fbc.created_at DESC
    `);

    const [recipientTasks] = await db.query(`
      SELECT
        d.id AS donation_id,
        d.donor_id,

        d.meal_name,
        r.requested_portions AS quantity,
        d.quantity_unit,
        d.expiry_window,
        d.notes,
        d.image_url,
        d.status AS donation_status,
        d.created_at,

        donor.name AS donor_name,
        donor.phone AS donor_phone,
        donor.latitude AS pickup_latitude,
        donor.longitude AS pickup_longitude,
        d.location AS pickup_address,

        r.id AS request_id,
        'RECIPIENT' AS task_type,
        r.fulfillment_method,
        r.delivery_address AS destination_address,

        recipient.latitude AS destination_latitude,
        recipient.longitude AS destination_longitude

      FROM requests r

      INNER JOIN donations d
        ON d.id = r.donation_id

      INNER JOIN users donor
        ON d.donor_id = donor.id

      INNER JOIN users recipient
        ON r.recipient_id = recipient.id

      WHERE r.fulfillment_method = 'Volunteer Driver Delivery'
        AND r.status NOT IN ('Cancelled', 'Rejected', 'Completed')
        AND d.status IN ('Pending', 'Active')

      ORDER BY r.requested_at DESC
    `);

    const tasks = [...foodBankTasks, ...recipientTasks];

    return res.json({
      success: true,
      count: tasks.length,
      pickups: tasks,
    });
  } catch (error) {
    console.error("Get driver pickups error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load driver delivery tasks",
    });
  }
};

// =====================================================
// UPDATE DELIVERY STATUS
// =====================================================

const updateDriverTaskStatus = async (req, res) => {
  try {
    const {
      taskType,
      claimId,
      requestId,
      status,
    } = req.body;

    const allowedStatuses = [
      "ACCEPTED",
      "PICKED_UP",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery status.",
      });
    }

    // =================================================
    // FOOD BANK DELIVERY
    // =================================================

    if (taskType === "FOOD_BANK") {
      if (!claimId) {
        return res.status(400).json({
          success: false,
          message: "Food Bank claim ID is required.",
        });
      }

      const claimStatusMap = {
        ACCEPTED: "Assigned",
        PICKED_UP: "Ready for Pickup",
        DELIVERED: "Completed",
        CANCELLED: "Cancelled",
      };

      const newStatus = claimStatusMap[status];

      const [result] = await db.query(
        `
        UPDATE food_bank_claims
        SET status = ?
        WHERE id = ?
        `,
        [newStatus, claimId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Food Bank claim not found.",
        });
      }
    }

    // =================================================
    // RECIPIENT DELIVERY
    // =================================================

    else if (taskType === "RECIPIENT") {
      if (!requestId) {
        return res.status(400).json({
          success: false,
          message: "Recipient request ID is required.",
        });
      }

      const requestStatusMap = {
        ACCEPTED: "Approved",
        PICKED_UP: "Approved",
        DELIVERED: "Completed",
        CANCELLED: "Cancelled",
      };

      const newStatus = requestStatusMap[status];

      const [result] = await db.query(
        `
        UPDATE requests
        SET status = ?
        WHERE id = ?
        `,
        [newStatus, requestId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Recipient request not found.",
        });
      }
    }

    else {
      return res.status(400).json({
        success: false,
        message: "Invalid task type.",
      });
    }

    return res.json({
      success: true,
      message: "Driver task status updated successfully.",
    });

  } catch (error) {
    console.error("Update driver task status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update delivery status.",
    });
  }
};

// =====================================================
// GET DRIVER DELIVERY HISTORY
// =====================================================

const getDriverHistory = async (req, res) => {
  try {
    // =================================================
    // COMPLETED FOOD BANK DELIVERIES
    // =================================================

    const [foodBankHistory] = await db.query(`
      SELECT
        d.id AS donation_id,
        d.meal_name AS title,
        d.quantity,
        d.quantity_unit,
        d.image_url,

        donor.address AS pickup_address,
        fbc.pickup_location AS destination_address,

        fbc.id AS claim_id,
        'FOOD_BANK' AS task_type,
        fbc.status,
        fbc.updated_at AS completed_at

      FROM food_bank_claims fbc

      INNER JOIN donations d
        ON d.id = fbc.donation_id

      INNER JOIN users donor
        ON d.donor_id = donor.id

      WHERE fbc.fulfillment_method = 'Volunteer Driver Delivery'
        AND fbc.status = 'Completed'

      ORDER BY fbc.updated_at DESC
    `);

    // =================================================
    // COMPLETED RECIPIENT DELIVERIES
    // =================================================

    const [recipientHistory] = await db.query(`
      SELECT
        d.id AS donation_id,
        d.meal_name AS title,
        r.requested_portions AS quantity,
        d.quantity_unit,
        d.image_url,

        donor.address AS pickup_address,
        r.delivery_address AS destination_address,

        r.id AS request_id,
        'RECIPIENT' AS task_type,
        r.status,
        r.updated_at AS completed_at

      FROM requests r

      INNER JOIN donations d
        ON d.id = r.donation_id

      INNER JOIN users donor
        ON d.donor_id = donor.id

      WHERE r.fulfillment_method = 'Volunteer Driver Delivery'
        AND r.status = 'Completed'

      ORDER BY r.updated_at DESC
    `);

    // =================================================
    // COMBINE BOTH TYPES
    // =================================================

    const history = [
      ...foodBankHistory,
      ...recipientHistory,
    ].sort(
      (a, b) =>
        new Date(b.completed_at) -
        new Date(a.completed_at)
    );

    return res.json({
      success: true,
      count: history.length,
      deliveries: history,
    });

  } catch (error) {
    console.error("Get driver history error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load driver history",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getDriverPickups,
  updateDriverTaskStatus,
  getDriverHistory,
};