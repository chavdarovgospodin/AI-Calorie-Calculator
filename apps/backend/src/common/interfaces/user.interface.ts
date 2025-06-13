export interface User {
  id: string;
  email: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  goal: string;
  daily_calorie_goal: number;
  activity_level: string;
  created_at: string;
  updated_at: string;
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum Goal {
  LOSE_WEIGHT = 'lose_weight',
  MAINTAIN_WEIGHT = 'maintain_weight',
  GAIN_WEIGHT = 'gain_weight',
  BUILD_MUSCLE = 'build_muscle',
}

export enum ActivityLevel {
  SEDENTARY = 'sedentary',
  LIGHTLY_ACTIVE = 'lightly_active',
  MODERATELY_ACTIVE = 'moderately_active',
  VERY_ACTIVE = 'very_active',
  EXTREMELY_ACTIVE = 'extremely_active',
}
