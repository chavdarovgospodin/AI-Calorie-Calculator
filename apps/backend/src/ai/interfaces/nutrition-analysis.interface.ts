export interface NutritionAnalysis {
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  foods: FoodItem[];
}

export interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface AiAnalysisRequest {
  type: 'text' | 'image';
  content: string;
  userId?: string;
}

export interface AiAnalysisResponse {
  success: boolean;
  data?: NutritionAnalysis;
  error?: string;
  processingTime?: number;
}
