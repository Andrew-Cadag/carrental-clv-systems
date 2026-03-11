import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
});

// Add interceptor to read token from sessionStorage on every request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const setAuthToken = (token) => {
  // This is still useful for initial setup, but interceptor handles all requests
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
