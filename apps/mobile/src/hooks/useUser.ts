import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { User } from '@/types/user';
import Toast from 'react-native-toast-message';

export const useUserProfile = () => {
  return useQuery<User>({
    queryKey: ['user-profile'],
    queryFn: () => apiClient.get('/users/profile'),
    staleTime: 10 * 60 * 1000, // Fresh for 10 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<
    User,
    Error,
    {
      age?: number;
      gender?: string;
      height?: number;
      weight?: number;
      goal?: string;
      activity_level?: string;
    }
  >({
    mutationFn: profileData => {
      return apiClient.put('/users/profile', profileData);
    },
    onSuccess: data => {
      queryClient.setQueryData(['user-profile'], data);

      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      Toast.show({
        type: 'success',
        text1: 'Profile Updated!',
        text2: 'Your settings have been saved',
      });
    },
  });
};

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

export const useUserStats = (period: 'week' | 'month' | 'year' = 'week') => {
  return useQuery({
    queryKey: ['user-stats', period],
    queryFn: () => apiClient.get(`/users/stats?period=${period}`),
    staleTime: 30 * 60 * 1000, // Fresh for 30 minutes
  });
};
