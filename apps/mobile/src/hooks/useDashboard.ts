// apps/mobile/src/hooks/api/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { DailyDashboard } from '@/screens/Dashboard/HomeScreen';

export const useDashboard = (date?: string) => {
  return useQuery({
    queryKey: ['dashboard', date || 'today'],
    queryFn: async () => {
      const params = date ? { date } : {};
      return apiClient.get<DailyDashboard>('/daily-logs/dashboard', { params });
    },
    refetchInterval: 2 * 60 * 1000, // Auto-refresh на всеки 2 минути
  });
};
