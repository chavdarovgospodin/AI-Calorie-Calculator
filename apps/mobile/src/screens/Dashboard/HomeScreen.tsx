import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardApi, foodApi } from '../../services/api';
import Toast from 'react-native-toast-message';
import { styles } from './styles';

const HomeScreen = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('📊 Loading dashboard data...');
      const data = await dashboardApi.getDashboard();
      setDashboardData(data);
      console.log('✅ Dashboard data loaded');
    } catch (error) {
      console.error('❌ Failed to load dashboard:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load dashboard data',
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Toast.show({
                type: 'success',
                text1: 'Logged out',
                text2: 'See you soon!',
              });
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        },
      ]
    );
  };

  const testFoodAnalysis = async () => {
    try {
      Toast.show({
        type: 'info',
        text1: 'Analyzing...',
        text2: 'Testing food analysis',
      });

      const result = await foodApi.analyzeText('1 ябълка');
      
      Toast.show({
        type: 'success',
        text1: 'Analysis Complete!',
        text2: `${result.totalCalories} calories detected`,
      });

      loadDashboardData();
      
    } catch (error) {
      console.error('❌ Food analysis failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Analysis Failed',
        text2: 'Please try again',
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        
        {dashboardData ? (
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {dashboardData.netCalories || 0}
              </Text>
              <Text style={styles.statLabel}>Net Calories</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {dashboardData.dailyCalorieGoal || 0}
              </Text>
              <Text style={styles.statLabel}>Daily Goal</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {dashboardData.remainingCalories || 0}
              </Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noDataText}>No data available</Text>
        )}

        {dashboardData && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(dashboardData.progressPercentage, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {dashboardData.progressPercentage}% of daily goal
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionsCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={testFoodAnalysis}>
          <Text style={styles.actionIcon}>🧪</Text>
          <Text style={styles.actionText}>Test Food Analysis</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📸</Text>
          <Text style={styles.actionText}>Analyze Food Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📝</Text>
          <Text style={styles.actionText}>Add Food Manually</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionText}>View Progress</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default HomeScreen;