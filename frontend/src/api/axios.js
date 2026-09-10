// frontend/src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: "/api",
});

// Request interceptor to attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("payroll_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiry
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes("/login")) {
      localStorage.removeItem("payroll_token");
      localStorage.removeItem("payroll_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;