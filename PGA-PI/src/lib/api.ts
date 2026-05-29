import axios, { InternalAxiosRequestConfig } from 'axios';
import { API_URL, BASE_ROUTE } from '@lib/config';

/** Extends AxiosRequestConfig to carry the retry flag without `as any` casts */
interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/** Prevents multiple concurrent token-refresh calls when several 401s arrive simultaneously */
let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequest | undefined;

    // Se o access token expirou, tenta renovar via refresh token (cookie)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login') &&
      !window.location.pathname.includes('/login') &&
      !window.location.pathname.includes('/reset-password')
    ) {
      // If a refresh is already in progress, queue this request until it resolves
      if (isRefreshing) {
        return new Promise<void>((resolve) => {
          refreshQueue.push(resolve);
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        refreshQueue.forEach((resolve) => resolve());
        refreshQueue = [];
        return api(originalRequest);
      } catch (refreshError) {
        refreshQueue = [];
        localStorage.removeItem('userData');
        window.location.href = `${BASE_ROUTE}login`;
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;