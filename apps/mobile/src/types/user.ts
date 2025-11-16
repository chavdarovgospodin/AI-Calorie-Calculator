import { ActivityLevel, Gender, Goal } from '../services/enums';

export interface User {
  id: string;
  email: string;
  age: number;
  gender: Gender; // Правилно типизиран с enum
  height: number;
  weight: number;
  goal: Goal;
  daily_calorie_goal: number;
  activity_level: ActivityLevel; // Правилно типизиран с enum
  created_at?: string;
  updated_at?: string;
}

export type UserProfile = Pick<
  User,
  'age' | 'gender' | 'height' | 'weight' | 'activity_level'
>;

export interface RegisterData {
  email: string;
  password: string;
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  goal: Goal;
  activity_level: ActivityLevel;
}
