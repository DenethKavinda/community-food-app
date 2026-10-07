import API from "./api";

// Fetch all food items created by the logged-in donor
export const fetchFoodItems = async () => {
  const response = await API.get("/food-items");
  return response.data;
};

// Fetch a single food item by ID
export const fetchFoodItemById = async (id) => {
  const response = await API.get(`/food-items/${id}`);
  return response.data;
};

// Create a new food item
export const createFoodItem = async (foodItemData) => {
  const response = await API.post("/food-items", foodItemData);
  return response.data;
};

// Update an existing food item
export const updateFoodItem = async (id, foodItemData) => {
  const response = await API.put(`/food-items/${id}`, foodItemData);
  return response.data;
};

// Delete a food item
export const deleteFoodItem = async (id) => {
  const response = await API.delete(`/food-items/${id}`);
  return response.data;
};
