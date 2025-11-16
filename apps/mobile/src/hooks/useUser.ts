// apps/mobile/src/hooks/api/useUser.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import Toast from 'react-native-toast-message';

// Get user profile
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: () => apiClient.get('/users/profile'),
    staleTime: 10 * 60 * 1000, // Fresh for 10 minutes
  });
};

// Update user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (profileData: {
      age?: number;
      gender?: string;
      height?: number;
      weight?: number;
      goal?: string;
      activity_level?: string;
    }) => {
      return apiClient.put('/users/profile', profileData);
    },
    onSuccess: data => {
      // Update cached profile
      queryClient.setQueryData(['user-profile'], data);

      // Invalidate dashboard as calorie goals may have changed
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      Toast.show({
        type: 'success',
        text1: 'Profile Updated!',
        text2: 'Your settings have been saved',
      });
    },
  });
};

// Delete user account
export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: () => apiClient.delete('/users/profile'),
    onSuccess: () => {
      Toast.show({
        type: 'info',
        text1: 'Account Deleted',
        text2: 'Your account has been permanently deleted',
      });
    },
  });
};

// Get user statistics
export const useUserStats = (period: 'week' | 'month' | 'year' = 'week') => {
  return useQuery({
    queryKey: ['user-stats', period],
    queryFn: () => apiClient.get(`/users/stats?period=${period}`),
    staleTime: 30 * 60 * 1000, // Fresh for 30 minutes
  });
};
