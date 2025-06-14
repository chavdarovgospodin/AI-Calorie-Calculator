import { ActivityLevel, Gender, Goal } from '../interfaces/user.interface';

export const calculateDailyCalories = (
  age: number,
  gender: Gender,
  height: number,
  weight: number,
  goal: Goal,
  activityLevel: ActivityLevel
): number => {
  // Mifflin-St Jeor Equation for BMR (Basal Metabolic Rate)
  let bmr: number;
  if (gender === Gender.MALE) {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  // Activity level multipliers
  const activityMultipliers = {
    [ActivityLevel.SEDENTARY]: 1.2,
    [ActivityLevel.LIGHTLY_ACTIVE]: 1.375,
    [ActivityLevel.MODERATELY_ACTIVE]: 1.55,
    [ActivityLevel.VERY_ACTIVE]: 1.725,
    [ActivityLevel.EXTREMELY_ACTIVE]: 1.9,
  };
  // Calculate TDEE (Total Daily Energy Expenditure)
  const tdee = bmr * activityMultipliers[activityLevel];
  // Adjust based on goal
  switch (goal) {
    case Goal.LOSE_WEIGHT:
      return Math.round(tdee - 500); // 500 calorie deficit for ~1lb/week loss
    case Goal.GAIN_WEIGHT:
    case Goal.BUILD_MUSCLE:
      return Math.round(tdee + 300); // 300 calorie surplus
    case Goal.MAINTAIN_WEIGHT:
    default:
      return Math.round(tdee);
  }
};
