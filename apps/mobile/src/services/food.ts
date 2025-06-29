import { apiClient } from './api';
import { FoodAnalysisResult } from './interfaces';

export const analyzeFood = async (
  description: string
): Promise<FoodAnalysisResult> => {
  const response = await apiClient.post('/food/analyze/text', {
    description: description.trim(),
  });
  return response.data;
};

export const analyzeFoodImage = async (
  imageBase64: string
): Promise<FoodAnalysisResult> => {
  const formData = new FormData();

  formData.append('image', {
    uri: imageBase64,
    type: 'image/jpeg',
    name: 'food_image.jpg',
  } as any);

  const response = await apiClient.post('/food/analyze/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const saveFoodEntry = async (foodData: {
  foods: FoodAnalysisResult['foods'];
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
}) => {
  const response = await apiClient.post('/food/entries', {
    foods: foodData.foods,
    totalCalories: foodData.totalCalories,
    protein: foodData.protein,
    carbs: foodData.carbs,
    fat: foodData.fat,
    date: new Date().toISOString().split('T')[0], // Today's date
  });
  return response.data;
};
