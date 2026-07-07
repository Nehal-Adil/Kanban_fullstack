import axios from "axios";
import { useAuthStore } from "../store/authStore";

/**
 * an Axios instance that handles your base URL, automatically injects your JWT auth token from your Zustand store, and catches global errors.
 */
export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to automatically attach JWT token
axiosClient.interceptors.request.use(
  (config) => {
    // Accessing token from store
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for global error handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error.response?.data || error.message);
  },
);
