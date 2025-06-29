import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/contexts/AuthContext';
import ActivitySummary from '@/components/ActivitySummary/ActivitySummary';
import { styles } from './styles';
import { getDailyLogs } from '@/services/health';

export interface DailyDashboard {
  totalCaloriesConsumed: number;
  targetCalories: number;
  caloriesBurned: number;
  remainingCalories: number;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState<DailyDashboard | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data: DailyDashboard = await getDailyLogs();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const handleFoodInput = () => {
    navigation.navigate('FoodAnalysis');
  };

  const handleLogout = async () => {
    await logout();
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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hello, {user?.email?.split('@')[0] || 'there'}! 👋
        </Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

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

        {dashboard && dashboard.caloriesBurned > 0 && (
          <View style={styles.netCaloriesContainer}>
            <Text style={styles.netCaloriesLabel}>Net Calories:</Text>
            <Text style={styles.netCaloriesValue}>{getNetCalories()}</Text>
          </View>
        )}

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

      <ActivitySummary onRefresh={loadDashboard} />

      <TouchableOpacity style={styles.addFoodButton} onPress={handleFoodInput}>
        <Ionicons name="restaurant-outline" size={24} color="#fff" />
        <Text style={styles.addFoodText}>Add Food</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default HomeScreen;
