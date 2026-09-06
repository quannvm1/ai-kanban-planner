import axios from 'axios';

export function getApiBaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_API_URL;
  if (url) {
    if (url.includes('ai-kanban-api.onrender.com')) {
      url = url.replace('ai-kanban-api.onrender.com', 'ai-kanban-planner.onrender.com');
    }
    if (!url.includes('localhost')) {
      return url;
    }
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://ai-kanban-planner.onrender.com/api/v1';
  }
  return 'http://localhost:4000/api/v1';
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (!config.baseURL || config.baseURL.includes('localhost')) {
    config.baseURL = getApiBaseUrl();
  }
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // Unwrap standard envelope response.data.data
    if (response.data && response.data.success !== undefined && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear token on 401
      localStorage.removeItem('access_token');
    }
    const message = error.response?.data?.message || error.message || 'Lỗi kết nối máy chủ';
    return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message));
  },
);
