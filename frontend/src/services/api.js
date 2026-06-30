import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api/v1' : ''),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the JWT token to requests
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

// Response interceptor to handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!navigator.onLine) {
      console.error('Network Error: You are offline.');
      return Promise.reject(new Error('You are currently offline. Please check your internet connection.'));
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('Network Error: Request timed out.');
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }

    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (status === 403) {
        console.error('Forbidden: You do not have permission.');
      } else if (status === 404) {
        console.error('Not Found: The requested resource does not exist.');
      } else if (status >= 500) {
        console.error('Server Error: Something went wrong on the server.');
      }
    } else {
      console.error('Network Error: Unable to reach the server.');
    }

    return Promise.reject(error);
  }
);

export default api;
