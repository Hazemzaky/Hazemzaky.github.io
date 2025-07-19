import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'https://masar-production-1c03.up.railway.app';

// Create axios instance with automatic token inclusion
const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

// Add request interceptor to automatically include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Request Interceptor - Token:', token ? 'Present' : 'Missing');
    console.log('API Request Interceptor - URL:', config.url);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request Interceptor - Authorization header added');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response - Success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log('API Response - Error:', error.response?.status, error.config?.url, error.response?.data);
    if (error.response?.status === 401) {
      // Token is invalid or expired, redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  get: (path: string, token?: string) => axios.get(`${API_BASE}/api${path}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  post: (path: string, data: any, token?: string) => axios.post(`${API_BASE}/api${path}`, data, token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  put: (path: string, data: any, token?: string) => axios.put(`${API_BASE}/api${path}`, data, token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  delete: (path: string, token?: string) => axios.delete(`${API_BASE}/api${path}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
};

// Export the authenticated API instance as default
export default api; 