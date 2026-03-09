import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
});

// Helper to validate JWT expiry (best-effort, client-side only).
const isTokenValid = (token) => {
    try {
        const [, payloadBase64] = token.split('.');
        if (!payloadBase64) return false;
        const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(payloadJson);
        if (!payload.exp) return true; // no exp: treat as non-expiring
        const nowSeconds = Math.floor(Date.now() / 1000);
        return payload.exp > nowSeconds;
    } catch {
        return false;
    }
};

// Request interceptor to attach a *valid* JWT token.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && isTokenValid(token)) {
            config.headers.Authorization = `Bearer ${token}`;
        } else if (token && !isTokenValid(token)) {
            // Clear invalid/expired tokens proactively.
            localStorage.removeItem('token');
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Optional response interceptor: clear invalid token on 401.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

export default api;
