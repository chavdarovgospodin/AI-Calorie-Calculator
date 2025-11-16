// apps/mobile/src/hooks/api/useAuth.ts
import { useMutation } from '@tanstack/react-query';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import { RegisterData, AuthResponse } from '@/services/interfaces';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export const useLogin = () => {
  const { dispatch } = useAuthContext();

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      return apiClient.post<AuthResponse>('/auth/login', { email, password });
    },
    onSuccess: async data => {
      // Запазваме tokens
      await Promise.all([
        AsyncStorage.setItem('access_token', data.access_token),
        AsyncStorage.setItem('refresh_token', data.refresh_token),
        AsyncStorage.setItem('user', JSON.stringify(data.user)),
      ]);

      dispatch({ type: 'AUTH_SUCCESS', payload: data.user });

      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: `Logged in as ${data.user.email}`,
      });
    },
    onError: (error: any) => {
      dispatch({
        type: 'AUTH_ERROR',
        payload: error.response?.data?.message || 'Login failed',
      });
    },
  });
};

export const useRegister = () => {
  const { dispatch } = useAuthContext();

  return useMutation({
    mutationFn: async (userData: RegisterData) => {
      return apiClient.post<AuthResponse>('/auth/register', userData);
    },
    onSuccess: async data => {
      await Promise.all([
        AsyncStorage.setItem('access_token', data.access_token),
        AsyncStorage.setItem('refresh_token', data.refresh_token),
        AsyncStorage.setItem('user', JSON.stringify(data.user)),
      ]);

      dispatch({ type: 'AUTH_SUCCESS', payload: data.user });

      Toast.show({
        type: 'success',
        text1: 'Account created!',
        text2: 'Welcome to Calorie Tracker',
      });
    },
    onError: (error: any) => {
      dispatch({
        type: 'AUTH_ERROR',
        payload: error.response?.data?.message || 'Registration failed',
      });
    },
  });
};
