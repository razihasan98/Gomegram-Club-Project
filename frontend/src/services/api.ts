import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to attach Bearer token and custom fallback headers/params
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('swapnosiri_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-Api-Token'] = token;
    config.headers['X-Admin-Token'] = token;
    config.headers['X-Authorization'] = `Bearer ${token}`;
    
    // Also pass as query param for proxies that strip auth headers
    config.params = {
      ...(config.params || {}),
      api_token: token,
    };
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response && 
      error.response.status === 401 && 
      !window.location.pathname.includes('/login')
    ) {
      localStorage.removeItem('swapnosiri_admin_token');
      localStorage.removeItem('swapnosiri_admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
