const pool = require("../config/db");

const VALID_FULFILLMENT_METHODS = ["Volunteer Driver Delivery", "Self Pickup"];

// ─────────────────────────────────────────────
// 1. CREATE REQUEST
// POST /api/requests
// ─────────────────────────────────────────────
exports.createRequest = async (req, res) => {
  // Authenticated recipient only — no fallback
  if (!req.user || !req.user.id) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required." });
  }

  const recipient_id = req.user.id;
  const {
    donation_id,
    requested_portions,
    fulfillment_method,
    delivery_address,
    delivery_latitude,
    delivery_longitude,
    contact_phone,
    special_instructions,
  } = req.body;

  // ── Field Validation ──────────────────────
  if (!donation_id) {
    return res
      .status(400)
      .json({ success: false, message: "donation_id is required." });
  }

  if (!requested_portions || Number(requested_portions) <= 0) {
    return res.status(400).json({
      success: false,
      message: "requested_portions must be a positive number.",
    });
  }

  if (!fulfillment_method || !VALID_FULFILLMENT_METHODS.includes(fulfillment_method)) {
    return res.status(400).json({
      success: false,
      message: `fulfillment_method must be one of: ${VALID_FULFILLMENT_METHODS.join(", ")}.`,
    });
  }

  if (fulfillment_method === "Volunteer Driver Delivery") {
    if (!delivery_address) {
      return res.status(400).json({
        success: false,
        message: "delivery_address is required when fulfillment_method is 'Volunteer Driver Delivery'.",
      });
    }
    if (delivery_latitude === undefined || delivery_longitude === undefined || delivery_latitude === null || delivery_longitude === null) {
      return res.status(400).json({
        success: false,
        message: "Exact map location is required for Volunteer Driver Delivery.",
      });
    }
    if (isNaN(Number(delivery_latitude)) || isNaN(Number(delivery_longitude))) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude must be valid numbers.",
      });
    }
  }

  if (!contact_phone) {
    return res
      .status(400)
      .json({ success: false, message: "contact_phone is required." });
  }

  try {
    // ── Check donation exists ─────────────────
    const [donations] = await pool.query(
      "SELECT id, status, quantity FROM donations WHERE id = ?",
      [donation_id]
    );

    if (donations.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Donation not found." });
    }

    // ── Check donation is available (Active or Pending) ──
    if (donations[0].status !== "Active" && donations[0].status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "This donation is no longer available for requests.",
      });
    }

    // ── Run Available Portions Validation ──
    const [reservedReqs] = await pool.query(
      "SELECT SUM(requested_portions) as reserved FROM requests WHERE donation_id = ? AND status NOT IN ('Cancelled')",
      [donation_id]
    );

    const originalQuantity = parseInt(donations[0].quantity) || 0;
    const reservedPortions = parseInt(reservedReqs[0]?.reserved) || 0;
    const availablePortions = Math.max(0, originalQuantity - reservedPortions);

    if (availablePortions <= 0) {
      return res.status(400).json({
        success: false,
        message: "This donation has no available portions remaining.",
      });
    }

    if (Number(requested_portions) > availablePortions) {
      return res.status(400).json({
        success: false,
        message: `Only ${availablePortions} portions are currently available.`,
      });
    }

    // ── Insert request ────────────────────────
    const [result] = await pool.query(
      `INSERT INTO requests
        (recipient_id, donation_id, requested_portions, fulfillment_method,
         delivery_address, delivery_latitude, delivery_longitude, contact_phone, special_instructions, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        recipient_id,
        donation_id,
        requested_portions,
        fulfillment_method,
        delivery_address || null,
        fulfillment_method === "Volunteer Driver Delivery" ? delivery_latitude : null,
        fulfillment_method === "Volunteer Driver Delivery" ? delivery_longitude : null,
        contact_phone,
        special_instructions || null,
      ]
    );

    const [newRequest] = await pool.query(
      "SELECT * FROM requests WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Request submitted successfully.",
      request: newRequest[0],
    });
  } catch (error) {
    console.error("createRequest error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error.", error: error.message });
  }
};

// ─────────────────────────────────────────────
// 2. GET MY REQUESTS
// GET /api/requests/my-requests
// ─────────────────────────────────────────────
exports.getMyRequests = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required." });
  }

  const recipient_id = req.user.id;

  try {
    const [requests] = await pool.query(
      `SELECT
         r.id,
         r.recipient_id,
         r.donation_id,
         r.requested_portions,
         r.fulfillment_method,
         r.delivery_address,
         r.delivery_latitude,
         r.delivery_longitude,
         r.contact_phone,
         r.special_instructions,
         r.status           AS request_status,
         r.requested_at,
         r.updated_at,
         d.meal_name,
         d.quantity         AS donation_quantity,
         d.location         AS donation_location,
         d.expiry_window,
         d.image_url,
         d.status           AS donation_status,
         dt.status          AS driver_task_status
       FROM requests r
       JOIN donations d ON r.donation_id = d.id
       LEFT JOIN driver_tasks dt ON dt.id = (SELECT MAX(id) FROM driver_tasks WHERE request_id = r.id)
       WHERE r.recipient_id = ?
       ORDER BY r.requested_at DESC`,
      [recipient_id]
    );

    return res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("getMyRequests error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error.", error: error.message });
  }
};

// ─────────────────────────────────────────────
// 3. GET SINGLE REQUEST BY ID
// GET /api/requests/:id
// ─────────────────────────────────────────────
exports.getRequestById = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required." });
  }

  const recipient_id = req.user.id;
  const { id } = req.params;

  try {
    const [requests] = await pool.query(
      `SELECT
         r.id,
         r.recipient_id,
         r.donation_id,
         r.requested_portions,
         r.fulfillment_method,
         r.delivery_address,
         r.delivery_latitude,
         r.delivery_longitude,
         r.contact_phone,
         r.special_instructions,
         r.status           AS request_status,
         r.requested_at,
         r.updated_at,
         d.meal_name,
         d.quantity         AS donation_quantity,
         d.location         AS donation_location,
         d.expiry_window,
         d.image_url,
         d.status           AS donation_status,
         dt.status          AS driver_task_status
       FROM requests r
       JOIN donations d ON r.donation_id = d.id
       LEFT JOIN driver_tasks dt ON dt.id = (SELECT MAX(id) FROM driver_tasks WHERE request_id = r.id)
       WHERE r.id = ? AND r.recipient_id = ?`,
      [id, recipient_id]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found or access denied.",
      });
    }

    const requestData = requests[0];

    // Compute available portions excluding the current request itself
    const [reservedReqs] = await pool.query(
      "SELECT SUM(requested_portions) as reserved FROM requests WHERE donation_id = ? AND status NOT IN ('Cancelled') AND id != ?",
      [requestData.donation_id, id]
    );

    const originalQuantity = parseInt(requestData.donation_quantity) || 0;
    const reservedPortions = parseInt(reservedReqs[0]?.reserved) || 0;
    const available_portions = Math.max(0, originalQuantity - reservedPortions);

    return res.json({ 
      success: true, 
      request: {
        ...requestData,
        available_portions
      } 
    });
  } catch (error) {
    console.error("getRequestById error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error.", error: error.message });
  }
};

// ─────────────────────────────────────────────
// 4. UPDATE REQUEST
// PATCH /api/requests/:id
// ─────────────────────────────────────────────
exports.updateRequest = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required." });
  }

  const recipient_id = req.user.id;
  const { id } = req.params;

  // Strip out fields that must never be updated by the client
  const {
    requested_portions,
    fulfillment_method,
    delivery_address,
    delivery_latitude,
    delivery_longitude,
    contact_phone,
    special_instructions,
  } = req.body;

  try {
    // ── Fetch the existing request ────────────
    const [existing] = await pool.query(
      "SELECT * FROM requests WHERE id = ? AND recipient_id = ?",
      [id, recipient_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found or access denied.",
      });
    }

    // ── Only Pending requests can be edited ───
    if (existing[0].status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Only Pending requests can be updated. This request is '${existing[0].status}'.`,
      });
    }

    // ── Validate provided fields ──────────────
    if (
      requested_portions !== undefined &&
      Number(requested_portions) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "requested_portions must be a positive number.",
      });
    }

    // ── Run Available Portions Validation ──
    const [donations] = await pool.query(
      "SELECT quantity FROM donations WHERE id = ?",
      [existing[0].donation_id]
    );

    const [reservedReqs] = await pool.query(
      "SELECT SUM(requested_portions) as reserved FROM requests WHERE donation_id = ? AND status NOT IN ('Cancelled') AND id != ?",
      [existing[0].donation_id, id]
    );

    const originalQuantity = parseInt(donations[0]?.quantity) || 0;
    const reservedPortions = parseInt(reservedReqs[0]?.reserved) || 0;
    const availablePortions = Math.max(0, originalQuantity - reservedPortions);

    if (
      requested_portions !== undefined &&
      Number(requested_portions) > availablePortions
    ) {
      return res.status(400).json({
        success: false,
        message: `Only ${availablePortions} portions are currently available.`,
      });
    }

    if (
      fulfillment_method !== undefined &&
      !VALID_FULFILLMENT_METHODS.includes(fulfillment_method)
    ) {
      return res.status(400).json({
        success: false,
        message: `fulfillment_method must be one of: ${VALID_FULFILLMENT_METHODS.join(", ")}.`,
      });
    }

    const updatedMethod =
      fulfillment_method !== undefined
        ? fulfillment_method
        : existing[0].fulfillment_method;

    let updatedAddress = existing[0].delivery_address;
    if (updatedMethod === "Self Pickup") {
      updatedAddress = null;
    } else if (delivery_address !== undefined) {
      updatedAddress = delivery_address;
    }

    if (updatedMethod === "Volunteer Driver Delivery") {
      if (!updatedAddress) {
        return res.status(400).json({
          success: false,
          message:
            "delivery_address is required when fulfillment_method is 'Volunteer Driver Delivery'.",
        });
      }
      if (
        delivery_latitude === undefined ||
        delivery_longitude === undefined ||
        delivery_latitude === null ||
        delivery_longitude === null
      ) {
        return res.status(400).json({
          success: false,
          message: "Exact map location is required for Volunteer Driver Delivery.",
        });
      }
    }

    if (contact_phone !== undefined && !contact_phone) {
      return res
        .status(400)
        .json({ success: false, message: "contact_phone cannot be empty." });
    }

    // ── Build update using only provided fields ─
    const updatedPortions      = requested_portions   !== undefined ? requested_portions   : existing[0].requested_portions;
    const updatedPhone         = contact_phone        !== undefined ? contact_phone        : existing[0].contact_phone;
    const updatedInstructions  = special_instructions !== undefined ? special_instructions : existing[0].special_instructions;

    await pool.query(
      `UPDATE requests
       SET requested_portions = ?,
           fulfillment_method = ?,
           delivery_address   = ?,
           delivery_latitude  = ?,
           delivery_longitude = ?,
           contact_phone      = ?,
           special_instructions = ?
       WHERE id = ? AND recipient_id = ?`,
      [
        updatedPortions,
        updatedMethod,
        updatedAddress || null,
        updatedMethod === "Volunteer Driver Delivery" ? delivery_latitude : null,
        updatedMethod === "Volunteer Driver Delivery" ? delivery_longitude : null,
        updatedPhone,
        updatedInstructions || null,
        id,
        recipient_id,
      ]
    );

    const [updated] = await pool.query(
      "SELECT * FROM requests WHERE id = ?",
      [id]
    );

    return res.json({
      success: true,
      message: "Request updated successfully.",
      request: updated[0],
    });
  } catch (error) {
    console.error("updateRequest error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error.", error: error.message });
  }
};

// ─────────────────────────────────────────────
// 5. CANCEL REQUEST
// PATCH /api/requests/:id/cancel
// ─────────────────────────────────────────────
exports.cancelRequest = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required." });
  }

  const recipient_id = req.user.id;
  const { id } = req.params;

  try {
    // ── Fetch the request ─────────────────────
    const [existing] = await pool.query(
      "SELECT * FROM requests WHERE id = ? AND recipient_id = ?",
      [id, recipient_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found or access denied.",
      });
    }

    // ── Only Pending requests can be cancelled ─
    if (existing[0].status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Only Pending requests can be cancelled. This request is '${existing[0].status}'.`,
      });
    }

    // ── Soft-cancel: update status only ───────
    await pool.query(
      "UPDATE requests SET status = 'Cancelled' WHERE id = ? AND recipient_id = ?",
      [id, recipient_id]
    );

    return res.json({
      success: true,
      message: "Request cancelled successfully.",
    });
  } catch (error) {
    console.error("cancelRequest error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error.", error: error.message });
  }
};
