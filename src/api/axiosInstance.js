import axios from "axios";
import { getToken, clearAllTokens } from "../shared/utils/tokenHelper";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_OT_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

console.log("BASE URL:", import.meta.env.VITE_OT_API_BASE_URL);

// ─── Request Interceptor ──────────────────────────────────────
// Har request mein automatically JWT token attach hoga
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token expire ya invalid → sab clear karo aur login pe bhejo
      clearAllTokens();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;