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

// Delete a donation post by ID
export const deleteDonation = async (id) => {
  const response = await API.delete(`/donations/${id}`);
  return response.data;
};
