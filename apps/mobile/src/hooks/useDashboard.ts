import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { DailyDashboard } from '@/screens/Dashboard/types';

export const useDashboard = (date?: string) => {
  return useQuery<DailyDashboard>({
    queryKey: ['dashboard', date || 'today'],
    queryFn: async () => {
      const params = date ? { date } : {};
      return apiClient.get('/daily-logs/dashboard', { params });
    },
    refetchInterval: 2 * 60 * 1000, // Auto-refresh на всеки 2 минути
  });
};
