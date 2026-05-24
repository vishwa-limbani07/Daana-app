// axiosClient.js — single axios instance used by every API call.
// Interceptors auto-attach the JWT to every outgoing request and handle
// 401 responses globally (log the user out, redirect to /login).

import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

// Attach token (read from localStorage — set by authStore on login)
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler
axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      // Redirect to login. Importing useNavigate here isn't possible;
      // we use a hard redirect for simplicity.
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default axiosClient;
