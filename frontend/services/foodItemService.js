import API from "./api";

// Fetch all food items created by a specific donor (defaults to donor_id 1)
export const fetchFoodItems = async (donorId = 1) => {
  const response = await API.get(`/food-items?donor_id=${donorId}`);
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
