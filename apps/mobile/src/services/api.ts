import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    error => {
      console.error('❌ API Error:', error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
  return client;
};

const apiClient = createApiClient();

export { apiClient };
