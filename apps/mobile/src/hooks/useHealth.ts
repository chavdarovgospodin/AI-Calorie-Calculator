// apps/mobile/src/hooks/api/useHealth.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

// Get weekly summary
export const useWeeklySummary = () => {
  return useQuery({
    queryKey: ['weekly-summary'],
    queryFn: () => apiClient.get('/daily-logs/weekly'),
    staleTime: 10 * 60 * 1000,
  });
};

// Get monthly statistics
export const useMonthlyStats = (year?: number, month?: number) => {
  const currentDate = new Date();
  const queryYear = year || currentDate.getFullYear();
  const queryMonth = month || currentDate.getMonth() + 1;

  return useQuery({
    queryKey: ['monthly-stats', queryYear, queryMonth],
    queryFn: () =>
      apiClient.get('/daily-logs/monthly', {
        params: { year: queryYear, month: queryMonth },
      }),
    staleTime: 30 * 60 * 1000,
  });
};

// Get progress data
export const useProgress = (days: number = 30) => {
  return useQuery({
    queryKey: ['progress', days],
    queryFn: () => apiClient.get(`/daily-logs/progress?days=${days}`),
    staleTime: 60 * 60 * 1000, // Fresh for 1 hour
  });
};

// Create or update daily log
export const useCreateDailyLog = () => {
  return useMutation({
    mutationFn: (logData: {
      date: string;
      notes?: string;
      weight?: number;
    }) => {
      return apiClient.post('/daily-logs', logData);
    },
  });
};
