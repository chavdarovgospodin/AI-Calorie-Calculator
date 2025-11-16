import AsyncStorage from '@react-native-async-storage/async-storage';

import { RegisterData, AuthResponse, User } from './interfaces';
import { apiClient } from './api';
import { ActivityLevel } from './enums';

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', {
    email: email,
    password: password,
  });

  try {
    await Promise.all([
      AsyncStorage.setItem('access_token', response.data.access_token),
      AsyncStorage.setItem('user', JSON.stringify(response.data.user)),
    ]);
  } catch (error) {
    throw error;
  }

  return response.data;
};

export const register = async (
  userData: RegisterData
): Promise<AuthResponse> => {
  const requestData = {
    email: userData.email.toLowerCase().trim(),
    password: userData.password,
    age: parseInt(userData.age.toString()),
    gender: userData.gender,
    height: parseFloat(userData.height.toString()),
    weight: parseFloat(userData.weight.toString()),
    goal: userData.goal,
    activity_level: ActivityLevel.MODERATELY_ACTIVE,
  };

  const response = await apiClient.post('/auth/register', requestData);

  try {
    await Promise.all([
      AsyncStorage.setItem('access_token', response.data.access_token),
      AsyncStorage.setItem('user', JSON.stringify(response.data.user)),
    ]);
  } catch (error) {
    throw error;
  }

  return response.data;
};

export const logout = async (): Promise<void> => {
  await AsyncStorage.multiRemove(['access_token', 'user']);
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem('access_token');
  return !!token;
};

export const getStoredUser = async (): Promise<User | null> => {
  try {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};
