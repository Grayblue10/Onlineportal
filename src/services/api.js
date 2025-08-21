import axios from 'axios';

// Use Vite environment variables for API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
  timeout: 15000, // 15s client-side timeout to avoid hanging requests
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses - let authService handle 401s for token refresh
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't handle 401s here - let authService handle token refresh
    return Promise.reject(error);
  }
);

export default api;