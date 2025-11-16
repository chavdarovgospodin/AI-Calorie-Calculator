import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as deviceHealth from '@/services/deviceHealth';
import { HealthAppType, HealthApp } from '@/types/health';
import Toast from 'react-native-toast-message';

export const useSelectedHealthApp = () => {
  return useQuery({
    queryKey: ['selected-health-app'],
    queryFn: async (): Promise<HealthAppType | null> => {
      const app = await AsyncStorage.getItem('selectedHealthApp');
      return app as HealthAppType | null;
    },
    staleTime: 5 * 60 * 1000, // Не се променя често
  });
};

export const useAvailableHealthApps = () => {
  return useQuery({
    queryKey: ['available-health-apps'],
    queryFn: async (): Promise<HealthApp[]> => {
      return deviceHealth.detectAvailableHealthApps();
    },
    staleTime: 5 * 60 * 1000, // Cache за 5 минути
  });
};

export const useSelectHealthApp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appType: HealthAppType) => {
      if (appType !== HealthAppType.MANUAL) {
        const hasPermissions = await deviceHealth.requestPermissions(appType);
        if (!hasPermissions) {
          throw new Error('Permissions denied');
        }
      }

      await AsyncStorage.setItem('selectedHealthApp', appType);
      return appType;
    },
    onSuccess: appType => {
      queryClient.setQueryData(['selected-health-app'], appType);
      queryClient.invalidateQueries({ queryKey: ['activity-summary'] });

      Toast.show({
        type: 'success',
        text1: 'Connected!',
        text2: 'Health app connected successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Connection Failed',
        text2: error.message || 'Failed to connect health app',
      });
    },
  });
};

export const useDisconnectHealthApp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem('selectedHealthApp');
      return null;
    },
    onSuccess: () => {
      queryClient.setQueryData(['selected-health-app'], null);
      queryClient.invalidateQueries({ queryKey: ['activity-summary'] });

      Toast.show({
        type: 'success',
        text1: 'Disconnected',
        text2: 'Health app disconnected successfully',
      });
    },
  });
};
