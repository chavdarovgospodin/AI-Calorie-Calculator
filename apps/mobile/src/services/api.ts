// apps/mobile/src/services/api.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface User {
  id: string;
  email: string;
  daily_calorie_goal: number;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface FoodAnalysisResult {
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: Array<{
    name: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

export interface DashboardData {
  date: string;
  dailyCalorieGoal: number;
  totalCaloriesConsumed: number;
  totalCaloriesBurned: number;
  netCalories: number;
  remainingCalories: number;
  progressPercentage: number;
}

// Create axios instance
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
  // Request interceptor
  client.interceptors.request.use(
    async config => {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log(
        `🔌 API Request: ${config.method?.toUpperCase()} ${config.url}`
      );
      return config;
    },
    error => Promise.reject(error)
  );

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
      return response;
    },
    error => {
      console.error('❌ API Error:', error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
  return client;
};
// API instance
const apiClient = createApiClient();
// Auth functions
export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    console.log('🔐 Mock login attempt:', email);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockResponse: AuthResponse = {
      access_token: 'mock-jwt-token-123',
      user: {
        id: '1',
        email,
        daily_calorie_goal: 2000,
      },
    };
    // Store in AsyncStorage
    await AsyncStorage.setItem('access_token', mockResponse.access_token);
    await AsyncStorage.setItem('user', JSON.stringify(mockResponse.user));
    return mockResponse;
  },

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove(['access_token', 'user']);
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('access_token');
    return !!token;
  },

  async getStoredUser(): Promise<User | null> {
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
};

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
