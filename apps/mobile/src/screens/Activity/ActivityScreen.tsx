// apps/mobile/src/screens/Activity/ActivityScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LoadingScreen } from '@/components';
import { styles } from './styles';
import { useActivitySummary } from '@/hooks/useActivity';

const ActivityScreen: React.FC = () => {
  const navigation = useNavigation();
  const today = new Date().toISOString().split('T')[0];

  // React Query hook - толкова просто!
  const {
    data: activity,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useActivitySummary(today);

  const handleAddActivity = () => {
    navigation.navigate('ManualActivity');
  };

  const handleHealthAppSettings = () => {
    navigation.navigate('HealthAppSelection');
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load activity data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progressPercentage = activity?.totalCaloriesBurned
    ? Math.min((activity.totalCaloriesBurned / 600) * 100, 100)
    : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      {/* Daily Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>

        <View style={styles.mainMetric}>
          <Text style={styles.caloriesValue}>
            {activity?.totalCaloriesBurned || 0}
          </Text>
          <Text style={styles.caloriesLabel}>calories burned</Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progressPercentage}%` }]}
          />
        </View>
        <Text style={styles.goalText}>
          Goal: 600 calories/day ({Math.round(progressPercentage)}%)
        </Text>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Ionicons name="footsteps" size={24} color="#007AFF" />
          <Text style={styles.metricValue}>{activity?.totalSteps || 0}</Text>
          <Text style={styles.metricLabel}>Steps</Text>
        </View>

        <View style={styles.metricItem}>
          <Ionicons name="navigate" size={24} color="#007AFF" />
          <Text style={styles.metricValue}>
            {activity?.totalDistance?.toFixed(1) || '0.0'}
          </Text>
          <Text style={styles.metricLabel}>km</Text>
        </View>

        <View style={styles.metricItem}>
          <Ionicons name="time" size={24} color="#007AFF" />
          <Text style={styles.metricValue}>
            {activity?.activities?.length || 0}
          </Text>
          <Text style={styles.metricLabel}>Activities</Text>
        </View>
      </View>

      {/* Activity List */}
      {activity?.activities && activity.activities.length > 0 && (
        <View style={styles.activitiesList}>
          <Text style={styles.sectionTitle}>Today's Activities</Text>
          {activity.activities.map((item: any, index: number) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityInfo}>
                <Text style={styles.activityType}>
                  {item.activity_type || 'Activity'}
                </Text>
                <Text style={styles.activityTime}>
                  {item.duration ? `${item.duration} min` : 'Manual entry'}
                </Text>
              </View>
              <Text style={styles.activityCalories}>
                {item.calories_burned} cal
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleAddActivity}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Log Activity</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleHealthAppSettings}
        >
          <Ionicons name="watch" size={20} color="#007AFF" />
          <Text style={styles.secondaryButtonText}>Health Apps</Text>
        </TouchableOpacity>
      </View>

      {/* Sync Status */}
      {activity?.source && (
        <View style={styles.syncInfo}>
          <Text style={styles.syncText}>Synced with: {activity.source}</Text>
          {activity.lastSync && (
            <Text style={styles.syncTime}>
              Last sync: {new Date(activity.lastSync).toLocaleTimeString()}
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default ActivityScreen;
