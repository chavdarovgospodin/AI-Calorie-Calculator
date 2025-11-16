import { StatusBar } from 'expo-status-bar';
import React from 'react';
import Toast from 'react-native-toast-message';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppNavigation } from './src/components';
import { AuthProvider } from './src/contexts/AuthContext';
import { ActivityProvider } from '@/contexts/ActivityContext';

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (error: any) => {
        const message =
          error.response?.data?.message ||
          error.message ||
          'Something went wrong';

        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: message,
        });
      },
    },
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error.response?.status >= 400 && error.response?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ActivityProvider>
          <AppNavigation />
          <StatusBar style="auto" />
          <Toast />
        </ActivityProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
