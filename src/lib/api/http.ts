import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

export interface ApiEnvelope<T> {
  success?: boolean;
  data: T;
  message?: string;
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
  };
}

export class ApiError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const tokenStore = {
  getAccessToken: () => localStorage.getItem('authToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  setTokens: (accessToken: string, refreshToken?: string) => {
    localStorage.setItem('authToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  },
  clear: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
  },
};

function unwrap<T>(payload: T | ApiEnvelope<T>): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}

function createClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = tokenStore.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  let refreshPromise: Promise<string | null> | null = null;

  client.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

      if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
        const data = error.response?.data as { message?: string } | undefined;
        throw new ApiError(data?.message || error.message || 'API request failed', error.response?.status, error.response?.data);
      }

      const refreshToken = tokenStore.getRefreshToken();
      if (!refreshToken) {
        tokenStore.clear();
        throw new ApiError('Session expired. Please sign in again.', 401, error.response?.data);
      }

      originalRequest._retry = true;

      refreshPromise ??= axios
        .post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
        .then(response => {
          const payload = unwrap<{ token?: string; accessToken?: string; refreshToken?: string }>(response.data);
          const accessToken = payload.accessToken || payload.token;
          if (!accessToken) throw new ApiError('Refresh response did not include an access token', 401, response.data);
          tokenStore.setTokens(accessToken, payload.refreshToken);
          return accessToken;
        })
        .catch(refreshError => {
          tokenStore.clear();
          throw refreshError;
        })
        .finally(() => {
          refreshPromise = null;
        });

      const newToken = await refreshPromise;
      if (newToken) originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return client(originalRequest);
    },
  );

  return client;
}

const http = createClient();

export const apiHttp = {
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await http.get<T | ApiEnvelope<T>>(url, { params });
    return unwrap<T>(response.data);
  },

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await http.post<T | ApiEnvelope<T>>(url, data);
    return unwrap<T>(response.data);
  },

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await http.patch<T | ApiEnvelope<T>>(url, data);
    return unwrap<T>(response.data);
  },

  async delete<T = void>(url: string): Promise<T> {
    const response = await http.delete<T | ApiEnvelope<T>>(url);
    return unwrap<T>(response.data);
  },
};

export { API_BASE_URL, tokenStore };
