import axios from 'axios';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0');

// Dynamic override from localStorage or window (helpful for testing & runtime configuration)
const localOverride =
  typeof window !== 'undefined'
    ? localStorage.getItem('cinebook_backend_url') || localStorage.getItem('cinebook_custom_api_url')
    : null;
const globalOverride = typeof window !== 'undefined' ? window.__CINEBOOK_API_URL__ : null;

// Build-time Vite environment variables (checks all common conventions)
const rawApiUrl =
  localOverride ||
  globalOverride ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_SERVER_URL;

const sanitizeApiUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  let trimmed = url.trim();
  // Auto-prepend https:// if user pasted domain without protocol
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  trimmed = trimmed.replace(/\/+$/, '');
  if (!trimmed.endsWith('/api/v1')) {
    if (trimmed.endsWith('/api')) {
      trimmed = `${trimmed}/v1`;
    } else {
      trimmed = `${trimmed}/api/v1`;
    }
  }
  return trimmed;
};

// Default Render Backend URL for production fallback
const DEFAULT_RENDER_BACKEND = 'https://cinebook-backend-i2k9.onrender.com/api/v1';

let API_BASE_URL = 'http://localhost:8000/api/v1';

if (rawApiUrl) {
  const formatted = sanitizeApiUrl(rawApiUrl);
  // If in production (Netlify/Vercel) and the build injected localhost, fallback to Render backend
  if (!isLocalhost && (formatted.includes('localhost') || formatted.includes('127.0.0.1'))) {
    API_BASE_URL = DEFAULT_RENDER_BACKEND;
  } else {
    API_BASE_URL = formatted;
  }
} else if (!isLocalhost) {
  API_BASE_URL = DEFAULT_RENDER_BACKEND;
} else {
  API_BASE_URL = 'http://localhost:8000/api/v1';
}

if (typeof window !== 'undefined') {
  console.info(`🎬 [CineBook] API Base URL: ${API_BASE_URL}`);
  window.__CINEBOOK_CURRENT_API__ = API_BASE_URL;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to attach JWT bearer token & dynamically update baseURL if localStorage was modified
api.interceptors.request.use(
  (config) => {
    const runtimeOverride =
      typeof window !== 'undefined'
        ? localStorage.getItem('cinebook_backend_url') || localStorage.getItem('cinebook_custom_api_url')
        : null;
    if (runtimeOverride) {
      config.baseURL = sanitizeApiUrl(runtimeOverride);
    }
    const token = localStorage.getItem('cinebook_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An error occurred';
    const customErr = new Error(message);
    customErr.status = error.response?.status;
    customErr.response = error.response;
    return Promise.reject(customErr);
  }
);

export { API_BASE_URL };
export default api;

