import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function checkApiHealth() {
  const response = await api.get('/health');
  return response.data;
}

export default api;
