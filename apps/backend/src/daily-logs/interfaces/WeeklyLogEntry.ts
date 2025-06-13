export interface WeeklyLogEntry {
    date: string;
    totalCaloriesConsumed: number;
    totalCaloriesBurned: number;
    netCalories: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
    };
}