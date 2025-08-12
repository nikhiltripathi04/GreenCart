import axios from 'axios';

// Create an Axios instance
// UPDATED: Using VITE_BACKEND_URL from environment variables
const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // This will be 'http://localhost:5000/api' in development
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to headers for authenticated requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Attach token as Bearer token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration or invalid tokens
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the token is expired or invalid (e.g., 401 Unauthorized, 403 Forbidden)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token'); // Remove invalid token
      // Optionally, redirect to login page or show a message
      window.location.href = '/'; // Simple redirect to root (which should be login page)
    }
    return Promise.reject(error);
  }
);

export default API;
