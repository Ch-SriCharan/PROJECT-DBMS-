import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if present in localStorage
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

// Response interceptor: Standardize error parsing and handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const response = error.response;
    if (response) {
      // 401 Unauthorized: token expired or invalid
      if (response.status === 401 && window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Do not force redirect if already on login/register
        if (!['/login', '/register'].includes(window.location.pathname)) {
          window.location.href = '/login?expired=true';
        }
      }

      const errorMessage =
        response.data?.message ||
        response.data?.error ||
        `Request failed with status ${response.status}`;
      return Promise.reject(new Error(errorMessage));
    }

    return Promise.reject(
      new Error(error.message || 'Network error: Cannot reach server')
    );
  }
);

export default api;
