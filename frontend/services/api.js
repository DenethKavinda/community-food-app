import axios from "axios";

const API_BASE_URL = "http://10.39.118.254:5000/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
