export interface FoodEntry {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
  created_at: string;
}

export interface DailyDashboard {
  totalCaloriesConsumed: number;
  targetCalories: number;
  caloriesBurned: number;
  remainingCalories: number;
  foodEntries: FoodEntry[];
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}
