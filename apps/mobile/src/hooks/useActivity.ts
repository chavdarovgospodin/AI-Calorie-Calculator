// apps/mobile/src/hooks/api/useActivity.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import Toast from 'react-native-toast-message';

// Get activity summary for a date
export const useActivitySummary = (date?: string) => {
  return useQuery({
    queryKey: ['activity-summary', date || 'today'],
    queryFn: async () => {
      const response = await apiClient.get('/activity/summary', {
        params: { date: date || new Date().toISOString().split('T')[0] },
      });
      return response;
    },
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
};

// Add manual activity
export const useAddManualActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activityData: {
      activityType: string;
      duration: number;
      intensity: 'low' | 'moderate' | 'high';
      caloriesBurned: number;
      notes?: string;
    }) => {
      return apiClient.post('/activity/manual', activityData);
    },
    onSuccess: data => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['activity-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      Toast.show({
        type: 'success',
        text1: 'Activity Logged!',
        text2: `${data.calories_burned} calories burned`,
      });
    },
  });
};

// Sync health app data
export const useSyncHealthApp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (syncData: {
      source: string;
      date: string;
      caloriesBurned: number;
      steps?: number;
      distance?: number;
      externalId?: string;
    }) => {
      return apiClient.post('/activity/sync', syncData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      Toast.show({
        type: 'success',
        text1: 'Activity Synced!',
        text2: 'Your health data has been updated',
      });
    },
  });
};

// Get available activity sources
export const useActivitySources = (platform: 'ios' | 'android') => {
  return useQuery({
    queryKey: ['activity-sources', platform],
    queryFn: () => apiClient.get(`/activity/sources?platform=${platform}`),
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });
};

// Update activity preferences
export const useUpdateActivityPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: {
      preferred_activity_source?: string;
      auto_sync_enabled?: boolean;
      activity_goal?: number;
    }) => {
      return apiClient.put('/activity/preferences', preferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-preferences'] });
    },
  });
};
