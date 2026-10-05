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

// Cancel a specific pending request
export const cancelRequest = async (id) => {
  const response = await API.patch(`/requests/${id}/cancel`);
  return response.data;
};
