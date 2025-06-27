import { ActivityLevel, Gender, Goal } from './enums';

export interface User {
  id: string;
  email: string;
  daily_calorie_goal: number;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface FoodAnalysisResult {
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: Array<{
    name: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

export interface DashboardData {
  date: string;
  dailyCalorieGoal: number;
  totalCaloriesConsumed: number;
  totalCaloriesBurned: number;
  netCalories: number;
  remainingCalories: number;
  progressPercentage: number;
}

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
