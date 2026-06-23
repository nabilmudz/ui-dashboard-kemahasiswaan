import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to append JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.accessToken) {
      config.headers['Authorization'] = `Bearer ${authStore.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and unauthorized errors (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore();

    // Check if the failed request is an authentication request
    const isAuthUrl = originalRequest.url && (
      originalRequest.url.includes('/auth/sso/token') ||
      originalRequest.url.includes('/auth/sso/refresh') ||
      originalRequest.url.includes('/auth/sso/revoke') ||
      originalRequest.url.includes('/auth/sso/callback')
    );

    // Check if error is unauthorized (401), we haven't retried yet, and it is NOT an authentication request
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthUrl) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the JWT token
        console.log('JWT Expired. Attempting to refresh token...');
        const newTokens = await authStore.refreshJWT();
        
        // Update request header with the new token
        originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed. Redirecting to login...', refreshError);
        authStore.clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
