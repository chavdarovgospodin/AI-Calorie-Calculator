// apps/mobile/src/screens/Dashboard/HomeScreen.tsx
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
          Здравей, {user?.email?.split('@')[0] || 'there'}! 👋
        </Text>
      </View>

      {/* Main Calorie Display */}
      <View style={styles.calorieCard}>
        <Text style={styles.calorieTitle}>Дневни калории</Text>
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
          {dashboard?.remainingCalories || 0} калории остават
        </Text>
      </View>

      {/* Quick Stats */}
      {/* <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="flame-outline" size={24} color="#FF6B35" />
          <Text style={styles.statValue}>{dashboard?.caloriesBurned || 0}</Text>
          <Text style={styles.statLabel}>Изгорени</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="restaurant-outline" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{getNetCalories()}</Text>
          <Text style={styles.statLabel}>Нетни</Text>
        </View>
      </View> */}

      {/* Prominent Add Food Button */}
      <TouchableOpacity style={styles.addFoodButton} onPress={handleFoodInput}>
        <View style={styles.addFoodButtonContent}>
          <Ionicons name="add-circle" size={32} color="#fff" />
          <View style={styles.addFoodTextContainer}>
            <Text style={styles.addFoodTitle}>Добави храна</Text>
            <Text style={styles.addFoodSubtitle}>Снимай или опиши</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Activity Summary Button */}
      <TouchableOpacity
        style={styles.activityButton}
        onPress={handleActivitySummary}
      >
        <Ionicons name="fitness-outline" size={24} color="#007AFF" />
        <Text style={styles.activityButtonText}>Виж активност</Text>
        <Ionicons name="chevron-forward" size={20} color="#007AFF" />
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Бързи действия</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="water-outline" size={24} color="#007AFF" />
            <Text style={styles.actionButtonText}>Вода</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="calendar-outline" size={24} color="#007AFF" />
            <Text style={styles.actionButtonText}>История</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="stats-chart-outline" size={24} color="#007AFF" />
            <Text style={styles.actionButtonText}>Прогрес</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
