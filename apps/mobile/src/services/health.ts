import { DailyDashboard } from '@/screens/Dashboard/HomeScreen';
import { apiClient } from './api';

export const getDailyLogs = async (): Promise<DailyDashboard> => {
  try {
    const response = await apiClient.get('/daily-logs/dashboard');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getTestCalculation = async (params: {
  params: {
    activity: string;
    duration: string;
    intensity: 'low' | 'moderate' | 'high';
  };
}): Promise<{ estimatedCalories: number }> => {
  try {
    const response = await apiClient.get('/activity/test-calculation', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const setManualActivity = async (activityData: Record<string, any>) => {
  try {
    const response = await apiClient.post('/activity/manual', activityData);
    return response;
  } catch (error) {}
};
