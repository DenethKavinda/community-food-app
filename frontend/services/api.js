import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://192.168.1.8:5000/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT token to every request automatically.
// This prevents race conditions where a screen mounts and fires an API call
// before AuthContext has finished reading the token from AsyncStorage.
API.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("jwt_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  } catch (e) {
    // If AsyncStorage read fails, continue without the token
    console.warn("Could not read jwt_token from AsyncStorage:", e);
  }
  return config;
});

export default API;
