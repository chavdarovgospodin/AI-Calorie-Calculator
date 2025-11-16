import AsyncStorage from '@react-native-async-storage/async-storage';
import { RegisterData, AuthResponse, User } from './interfaces';
import { apiClient } from './api';
import { ActivityLevel } from './enums';

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  TOKEN_EXPIRY: 'token_expiry',
};

const calculateTokenExpiry = () => {
  return new Date(Date.now() + 15 * 60 * 1000).toISOString();
};

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
      AsyncStorage.setItem('access_token', response.access_token),
      AsyncStorage.setItem('user', JSON.stringify(response.user)),
    ]);
  } catch (error) {
    throw error;
  }

  return response;
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
      AsyncStorage.setItem('access_token', response.access_token),
      AsyncStorage.setItem('user', JSON.stringify(response.user)),
    ]);
  } catch (error) {
    throw error;
  }

  return response;
};

export const refreshTokens = async (): Promise<boolean> => {
  try {
    const refreshToken = await AsyncStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    if (!refreshToken) return false;

    const response = await apiClient.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
    console.log(response);
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, response.access_token),
      AsyncStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, response.refresh_token),
      AsyncStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, calculateTokenExpiry()),
    ]);

    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

export const logout = async (): Promise<void> => {
  await AsyncStorage.multiRemove([
    TOKEN_KEYS.ACCESS_TOKEN,
    TOKEN_KEYS.REFRESH_TOKEN,
    TOKEN_KEYS.USER,
    TOKEN_KEYS.TOKEN_EXPIRY,
  ]);
};

export const isTokenExpired = async (): Promise<boolean> => {
  const expiry = await AsyncStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
  if (!expiry) return true;
  return new Date(expiry) <= new Date();
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  const refreshToken = await AsyncStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  return !!(token && refreshToken);
};

export const getStoredUser = async (): Promise<User | null> => {
  try {
    const userStr = await AsyncStorage.getItem(TOKEN_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};
