import { ActivityLevel, Gender, Goal } from '@/services/enums';

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  gender: Gender;
  height: string;
  weight: string;
  activity_level: ActivityLevel;
  goal: Goal;
}
