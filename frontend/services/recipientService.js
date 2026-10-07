import API from "./api";

// Fetch all available food donations for the Recipient Dashboard.
export const fetchAvailableFoods = async () => {
  const response = await API.get("/donations/available");
  return response.data;
};

// Fetch the current recipient's submitted food requests.
// Fetch the current recipient's submitted food requests.
export const fetchMyRequests = async () => {
  const response = await API.get("/requests/my-requests");
  return response.data;
};

// Create a new food request
export const createRequest = async (requestData) => {
  const response = await API.post("/requests", requestData);
  return response.data;
};

// Fetch a single request by ID
export const fetchRequestById = async (id) => {
  const response = await API.get(`/requests/${id}`);
  return response.data;
};

// Update an existing pending request
export const updateRequest = async (id, requestData) => {
  const response = await API.patch(`/requests/${id}`, requestData);
  return response.data;
};

// Cancel a specific pending request
export const cancelRequest = async (id) => {
  const response = await API.patch(`/requests/${id}/cancel`);
  return response.data;
};

// Fetch the authenticated recipient's profile details
export const fetchRecipientProfile = async () => {
  const response = await API.get("/recipient/profile");
  return response.data;
};

// Update the authenticated recipient's profile details
export const updateRecipientProfile = async (profileData) => {
  const response = await API.put("/recipient/profile", profileData);
  return response.data;
};

// Fetch a single donation by ID
export const fetchDonationById = async (id) => {
  const response = await API.get(`/donations/${id}`);
  return response.data;
};

// Fetch recipient notifications
export const fetchNotifications = async () => {
  const response = await API.get("/recipient/notifications");
  return response.data;
};

// Mark a single notification as read
export const markNotificationAsRead = async (id) => {
  const response = await API.patch(`/recipient/notifications/${id}/read`);
  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const response = await API.patch("/recipient/notifications/read-all");
  return response.data;
};

// Save a food-bank claim and its pickup/driver details.
export const createFoodBankClaim = async (claimData) => {
  const response = await API.post("/food-bank-claims", claimData);
  return response.data;
};

export const fetchFoodBankClaimHistory = async () => {
  const response = await API.get("/food-bank-claims/history");
  return response.data;
};

export const fetchFoodBankInventory = async () => {
  const response = await API.get("/food-bank-inventory");
  return response.data;
};

export const createFoodBankInventoryItem = async (item) => {
  const response = await API.post("/food-bank-inventory", item);
  return response.data;
};

export const deleteFoodBankInventoryItem = async (id) => {
  const response = await API.delete(`/food-bank-inventory/${id}`);
  return response.data;
};
