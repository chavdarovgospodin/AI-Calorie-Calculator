import { apiClient } from './api';
import { Gender, Goal } from './enums';

export interface UserProfile {
  id: string;
  email: string;
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  goal: Goal;
  calorie_goal: number;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileDto {
  age?: number;
  gender?: Gender;
  height?: number;
  weight?: number;
  goal?: Goal;
}

export const getUserProfile = async (): Promise<UserProfile> => {
  return await apiClient.get('/users/profile');
};

export const updateUserProfile = async (
  data: UpdateProfileDto
): Promise<UserProfile> => {
  const response = await apiClient.put('/users/profile', data);
  return response.data;
};

export const deleteUserProfile = async (): Promise<void> => {
  await apiClient.delete('/users/profile');
};

export const getUserStats = async () => {
  const response = await apiClient.get('/users/stats');
  return response.data;
};
