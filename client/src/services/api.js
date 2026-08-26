import axios from 'axios';
import { ACCESS_TOKEN_KEY } from '../constants/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url === '/auth/login';

    if (error.response?.status === 401 && !isLoginRequest && localStorage.getItem(ACCESS_TOKEN_KEY)) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem('lms_user');
      window.location.assign('/login');
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.request) return 'Unable to reach the server. Check that the API is running.';
  return fallback;
}

export function getFieldErrors(error) {
  return (error.response?.data?.errors || []).reduce((result, item) => {
    result[item.field] = item.message;
    return result;
  }, {});
}

export async function checkApiHealth() {
  const response = await api.get('/health');
  return response.data;
}

export default api;
