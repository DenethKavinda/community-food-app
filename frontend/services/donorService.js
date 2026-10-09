import API from "./api";

// Create a new food donation post
export const createDonation = async (donationData) => {
  const response = await API.post("/donations", donationData);
  return response.data;
};

// Fetch donations posted by the logged-in donor
export const getMyDonations = async (statusFilter) => {
  let url = "/donations/my-donations";
  if (statusFilter) {
    url += `?status=${encodeURIComponent(statusFilter)}`;
  }
  const response = await API.get(url);
  return response.data;
};

// Fetch single donation by ID
export const getDonationById = async (id) => {
  const response = await API.get(`/donations/${id}`);
  return response.data;
};

// Update donation status
export const updateDonationStatus = async (id, status) => {
  const response = await API.patch(`/donations/${id}/status`, { status });
  return response.data;
};

// Update donation details
export const updateDonation = async (id, donationData) => {
  const response = await API.put(`/donations/${id}`, donationData);
  return response.data;
};

// Delete a donation post by ID
export const deleteDonation = async (id) => {
  const response = await API.delete(`/donations/${id}`);
  return response.data;
};

// Fetch real donor statistics from backend
export const getDonorStats = async () => {
  const response = await API.get("/donations/stats");
  return response.data;
};

// Update user profile details
export const updateProfile = async (profileData) => {
  const response = await API.put("/auth/profile", profileData);
  return response.data;
};

// Fetch donor notifications
export const getDonorNotifications = async () => {
  const response = await API.get("/donations/notifications");
  return response.data;
};

// Mark a donor notification as read
export const markDonorNotificationRead = async (id) => {
  const response = await API.patch(`/donations/notifications/${id}/read`);
  return response.data;
};

// Mark all donor notifications as read
export const markAllDonorNotificationsRead = async () => {
  const response = await API.patch("/donations/notifications/read-all");
  return response.data;
};
