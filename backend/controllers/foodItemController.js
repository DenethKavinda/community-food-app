const pool = require("../config/db");

// 1. CREATE A FOOD ITEM
exports.createFoodItem = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please log in.",
    });
  }

  const { name, category, description } = req.body;
  const donor_id = req.user.id;

  if (!name || !name.trim() || !category || !category.trim()) {
    return res.status(400).json({
      success: false,
      message: "Food Name and Category are required.",
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO food_items (donor_id, name, category, description)
       VALUES (?, ?, ?, ?)`,
      [donor_id, name.trim(), category.trim(), description ? description.trim() : null]
    );

    const [newItem] = await pool.query(
      "SELECT * FROM food_items WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Food item created successfully.",
      foodItem: newItem[0],
    });
  } catch (error) {
    console.error("Create food item error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating food item.",
      error: error.message,
    });
  }
};

// 2. GET ALL FOOD ITEMS FOR A DONOR
exports.getFoodItems = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please log in.",
    });
  }

  const donor_id = req.user.id;

  try {
    const [foodItems] = await pool.query(
      "SELECT * FROM food_items WHERE donor_id = ? ORDER BY created_at DESC",
      [donor_id]
    );

    res.json({
      success: true,
      count: foodItems.length,
      foodItems,
    });
  } catch (error) {
    console.error("Get food items error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching food items.",
      error: error.message,
    });
  }
};

// 3. GET SINGLE FOOD ITEM BY ID
exports.getFoodItemById = async (req, res) => {
  const { id } = req.params;

  try {
    const [items] = await pool.query(
      "SELECT * FROM food_items WHERE id = ?",
      [id]
    );

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Food item not found.",
      });
    }

    res.json({
      success: true,
      foodItem: items[0],
    });
  } catch (error) {
    console.error("Get food item by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching food item.",
      error: error.message,
    });
  }
};

// 4. UPDATE A FOOD ITEM BY ID
exports.updateFoodItem = async (req, res) => {
  const { id } = req.params;
  const { name, category, description } = req.body;

  if (!name || !name.trim() || !category || !category.trim()) {
    return res.status(400).json({
      success: false,
      message: "Food Name and Category are required.",
    });
  }

  try {
    const [result] = await pool.query(
      `UPDATE food_items 
       SET name = ?, category = ?, description = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [name.trim(), category.trim(), description ? description.trim() : null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Food item not found.",
      });
    }

    const [updatedItem] = await pool.query(
      "SELECT * FROM food_items WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Food item updated successfully.",
      foodItem: updatedItem[0],
    });
  } catch (error) {
    console.error("Update food item error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating food item.",
      error: error.message,
    });
  }
};

// 5. DELETE A FOOD ITEM BY ID
exports.deleteFoodItem = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM food_items WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Food item not found.",
      });
    }

    res.json({
      success: true,
      message: "Food item deleted successfully.",
    });
  } catch (error) {
    console.error("Delete food item error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting food item.",
      error: error.message,
    });
  }
};
