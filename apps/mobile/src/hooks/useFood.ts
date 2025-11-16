import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { FoodAnalysisResult } from '@/types/food';
import Toast from 'react-native-toast-message';

// Analyze food text
export const useAnalyzeFood = () => {
  return useMutation({
    mutationFn: async (description: string) => {
      return apiClient.post<FoodAnalysisResult>('/food/analyze', {
        description,
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Analysis Failed',
        text2: error.response?.data?.message || 'Please try again',
      });
    },
  });
};

// Analyze food image
export const useAnalyzeFoodImage = () => {
  return useMutation({
    mutationFn: async (imageBase64: string) => {
      return apiClient.post<FoodAnalysisResult>('/food/analyze-image', {
        imageBase64,
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Image Analysis Failed',
        text2: error.response?.data?.message || 'Please try again',
      });
    },
  });
};

// Save food entry
export const useSaveFoodEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (foodData: FoodAnalysisResult) => {
      return apiClient.post('/food/entries', {
        foods: foodData.foods,
        totalCalories: foodData.totalCalories,
        protein: foodData.protein,
        carbs: foodData.carbs,
        fat: foodData.fat,
      });
    },
    onSuccess: () => {
      // Инвалидираме dashboard кеша
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      Toast.show({
        type: 'success',
        text1: 'Food Added!',
        text2: 'Successfully logged to your diary',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to save',
        text2: error.response?.data?.message || 'Please try again',
      });
    },
  });
};
