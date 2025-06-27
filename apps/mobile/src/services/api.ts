import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DashboardData, FoodAnalysisResult } from './interfaces';

const createApiClient = (): AxiosInstance => {
  const baseURL = __DEV__
    ? 'http://localhost:3000/api'
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

// Food API functions
export const foodApi = {
  async analyzeText(description: string): Promise<FoodAnalysisResult> {
    console.log('🍎 Mock food analysis:', description);

    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      totalCalories: 95,
      protein: 0.5,
      carbs: 25,
      fat: 0.3,
      foods: [
        {
          name: description,
          quantity: '1 piece',
          calories: 95,
          protein: 0.5,
          carbs: 25,
          fat: 0.3,
        },
      ],
    };
  },

  async analyzeImage(imageUri: string): Promise<FoodAnalysisResult> {
    console.log('📸 Mock image analysis:', imageUri);

    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      totalCalories: 450,
      protein: 25,
      carbs: 35,
      fat: 18,
      foods: [
        {
          name: 'Mixed meal from image',
          quantity: '1 serving',
          calories: 450,
          protein: 25,
          carbs: 35,
          fat: 18,
        },
      ],
    };
  },
};

// Dashboard API functions
export const dashboardApi = {
  async getDashboard(date?: string): Promise<DashboardData> {
    console.log('📊 Mock dashboard data for:', date || 'today');

    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      date: date || new Date().toISOString().split('T')[0],
      dailyCalorieGoal: 2000,
      totalCaloriesConsumed: 1250,
      totalCaloriesBurned: 300,
      netCalories: 950,
      remainingCalories: 1050,
      progressPercentage: 48,
    };
  },
};

// Export the client for direct use if needed
export { apiClient };
