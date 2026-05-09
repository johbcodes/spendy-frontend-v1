import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Track if we're currently refreshing the token
let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response.data; // Return just the data
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const data: any = error.response.data;

      console.error('🔴 [API Error] Status:', status);
      console.error('🔴 [API Error] Response data:', data);
      console.error('🔴 [API Error] URL:', error.config?.url);

      // Handle 401 errors with token refresh
      if (status === 401 && !originalRequest._retry) {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          // No refresh token available - force logout
          console.error('🔴 [API Error] No refresh token - clearing auth');
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('currentUser');
          window.location.reload();
          return Promise.reject(error);
        }

        if (isRefreshing) {
          // Already refreshing - queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return apiClient(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Attempt to refresh token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });

          const refreshPayload = response.data?.data || response.data;
          const newToken = refreshPayload.accessToken || refreshPayload.token;
          const newRefreshToken = refreshPayload.refreshToken;

          if (!newToken) {
            throw new Error('Token refresh response did not include an access token');
          }

          localStorage.setItem('authToken', newToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          processQueue(null, newToken);
          isRefreshing = false;

          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed - force logout
          processQueue(new Error('Token refresh failed'), null);
          isRefreshing = false;

          console.error('🔴 [API Error] Token refresh failed - clearing auth');
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('currentUser');
          window.location.reload();

          return Promise.reject(refreshError);
        }
      }

      switch (status) {
        case 403:
          // Forbidden
          console.error('Access forbidden:', data.message);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', data.message);
          break;
        case 500:
          // Server error
          console.error('Server error:', data.message);
          break;
        default:
          console.error('API Error:', data.message || error.message);
      }

      throw new Error(data.message || 'An error occurred');
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server');
      throw new Error('Network error - please check your connection');
    } else {
      // Something else happened
      console.error('Request error:', error.message);
      throw new Error(error.message);
    }
  }
);

export default apiClient;

// Helper function to handle API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
  };
}

// Export typed API client methods
export const api = {
  get: <T = any>(url: string, params?: any): Promise<ApiResponse<T>> =>
    apiClient.get(url, { params }),

  post: <T = any>(url: string, data?: any): Promise<ApiResponse<T>> =>
    apiClient.post(url, data),

  patch: <T = any>(url: string, data?: any): Promise<ApiResponse<T>> =>
    apiClient.patch(url, data),

  put: <T = any>(url: string, data?: any): Promise<ApiResponse<T>> =>
    apiClient.put(url, data),

  delete: <T = any>(url: string): Promise<ApiResponse<T>> =>
    apiClient.delete(url),
};
