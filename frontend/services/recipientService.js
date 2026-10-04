import API from "./api";

// Fetch all available food donations for the Recipient Dashboard.
// TODO: Uncomment call in index.js once the Donation backend endpoint is live.
export const fetchAvailableFoods = async () => {
  const response = await API.get("/recipient/foods");
  return response.data;
};

// Fetch the current recipient's submitted food requests.
// TODO: Uncomment call in my-requests.js once the Request API endpoint is live.
export const fetchMyRequests = async () => {
  const response = await API.get("/recipient/my-requests");
  return response.data;
};
