import { Goal } from '@/services/enums';
import { RegisterData } from '@/services/interfaces';

export const calculateDailyCalories = (userData: RegisterData): number => {
  let bmr: number;

  if (userData.gender === 'male') {
    bmr = 10 * userData.weight + 6.25 * userData.height - 5 * userData.age + 5;
  } else {
    bmr =
      10 * userData.weight + 6.25 * userData.height - 5 * userData.age - 161;
  }

  const activityMultiplier = 1.55;
  let tdee = Math.round(bmr * activityMultiplier);

  switch (userData.goal) {
    case Goal.LOSE_WEIGHT:
      return tdee - 500; // 500 calorie deficit for ~0.5kg/week loss
    case Goal.GAIN_WEIGHT:
      return tdee + 500; // 500 calorie surplus for ~0.5kg/week gain
    default:
      return tdee; // maintain
  }
};
