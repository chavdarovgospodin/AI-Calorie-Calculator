import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/contexts/AuthContext';
import { styles } from './styles';
import { getDailyLogs } from '@/services/health';
import { LoadingScreen, RecentFood } from '@/components';

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

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DailyDashboard | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data: DailyDashboard = await getDailyLogs();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const handleFoodInput = () => {
    navigation.navigate('FoodInput');
  };

  const handleActivitySummary = () => {
    navigation.navigate('Activity');
  };

  const getCalorieColor = () => {
    if (!dashboard) return '#333';
    const percentage =
      (dashboard.totalCaloriesConsumed / dashboard.targetCalories) * 100;
    if (percentage < 90) return '#4CAF50';
    if (percentage < 100) return '#FF9800';
    return '#F44336';
  };

  const getNetCalories = () => {
    if (!dashboard) return 0;
    return dashboard.totalCaloriesConsumed - dashboard.caloriesBurned;
  };

  const handleDeleteFood = useCallback((foodId: string) => {
    Alert.alert(
      'Delete Food',
      'Are you sure you want to remove this food entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete functionality
            console.log('Delete food:', foodId);
          },
        },
      ]
    );
  }, []);

  if (isLoading || refreshing) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hello, {user?.email?.split('@')[0] || 'there'}! 👋
        </Text>
      </View>

      {/* Main Calorie Display */}
      <View style={styles.calorieCard}>
        <Text style={styles.calorieTitle}>Daily Calories</Text>
        <View style={styles.calorieMain}>
          <Text style={[styles.calorieValue, { color: getCalorieColor() }]}>
            {dashboard?.totalCaloriesConsumed || 0}
          </Text>
          <Text style={styles.calorieDivider}>/</Text>
          <Text style={styles.calorieTarget}>
            {dashboard?.targetCalories || 2000}
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(
                  ((dashboard?.totalCaloriesConsumed || 0) /
                    (dashboard?.targetCalories || 2000)) *
                    100,
                  100
                )}%`,
                backgroundColor: getCalorieColor(),
              },
            ]}
          />
        </View>
        <Text style={styles.remainingText}>
          {dashboard?.remainingCalories || 0} calories remaining
        </Text>
      </View>

      {/* Macros Summary */}
      {dashboard?.macros && (
        <View style={styles.macrosCard}>
          <Text style={styles.macrosTitle}>Macros</Text>
          <View style={styles.macrosRow}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{dashboard.macros.protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{dashboard.macros.carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{dashboard.macros.fat}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
          </View>
        </View>
      )}

      {dashboard && (
        <RecentFood dashboard={dashboard} handleDeleteFood={handleDeleteFood} />
      )}

      {/* Prominent Add Food Button */}
      <TouchableOpacity style={styles.addFoodButton} onPress={handleFoodInput}>
        <View style={styles.addFoodButtonContent}>
          <Ionicons name="add-circle" size={32} color="#fff" />
          <View style={styles.addFoodTextContainer}>
            <Text style={styles.addFoodTitle}>Add Food</Text>
            <Text style={styles.addFoodSubtitle}>Photo or description</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Activity Summary Button */}
      <TouchableOpacity
        style={styles.activityButton}
        onPress={handleActivitySummary}
      >
        <Ionicons name="fitness-outline" size={24} color="#007AFF" />
        <Text style={styles.activityButtonText}>View Activity</Text>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.quickActionItem}>
            <Ionicons name="water-outline" size={24} color="#007AFF" />
            <Text style={styles.quickActionText}>Water</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem}>
            <Ionicons name="calendar-outline" size={24} color="#007AFF" />
            <Text style={styles.quickActionText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem}>
            <Ionicons name="trending-up-outline" size={24} color="#007AFF" />
            <Text style={styles.quickActionText}>Progress</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
