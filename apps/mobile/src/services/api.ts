import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { refreshTokens, logout } from './auth';

const createApiClient = (): AxiosInstance => {
  const baseURL = __DEV__
    ? 'http://192.168.1.7:3000/api' // <-- Твоето IP от Expo
    : 'https://your-production-api.com';

  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  // Request interceptor
  client.interceptors.request.use(
    async config => {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    async (error: AxiosError) => {
      const originalRequest: any = error.config;

      // Skip refresh for auth endpoints
      if (originalRequest?.url?.includes('/auth/')) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const success = await refreshTokens();
          if (success) {
            const token = await AsyncStorage.getItem('access_token');
            processQueue(null, token);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          } else {
            processQueue(error, null);
            await logout();
            // Navigate to login screen (you'll need to emit an event or use navigation ref)
            return Promise.reject(error);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          await logout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      console.error('❌ API Error:', error.response?.data || error.message);
      return Promise.reject(error);
    }
  );

  return client;
};

const apiClient = createApiClient();

export { apiClient };
