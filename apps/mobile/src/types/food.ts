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
