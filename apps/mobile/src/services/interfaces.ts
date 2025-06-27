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
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum Goal {
  LOSE_WEIGHT = 'lose_weight',
  MAINTAIN_WEIGHT = 'maintain_weight',
  GAIN_WEIGHT = 'gain_weight',
  // BUILD_MUSCLE = 'build_muscle',
}

export enum ActivityLevel {
  SEDENTARY = 'sedentary',
  LIGHTLY_ACTIVE = 'lightly_active',
  MODERATELY_ACTIVE = 'moderately_active',
  VERY_ACTIVE = 'very_active',
  EXTREMELY_ACTIVE = 'extremely_active',
}
