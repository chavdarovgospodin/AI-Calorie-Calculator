import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useActivity } from '@/contexts/ActivityContext';
import { styles } from './styles';
import { HealthAppType } from '@/services/healthService/interfaces';

interface ActivitySummaryProps {
  date?: string;
  onRefresh?: () => void;
}

const ActivitySummary: React.FC<ActivitySummaryProps> = ({
  date,
  onRefresh,
}) => {
  const navigation = useNavigation();
  const {
    selectedApp,
    isConnected,
    todayActivity,
    syncActivityData,
    getActivitySummary,
    isLoading,
  } = useActivity();

  const [summary, setSummary] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadActivitySummary();
  }, [date]);

  const loadActivitySummary = async () => {
    const summaryData = await getActivitySummary(date);
    setSummary(summaryData);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await syncActivityData();
    await loadActivitySummary();
    if (onRefresh) {
      onRefresh();
    }
    setRefreshing(false);
  };

  const handleConnectApp = () => {
    navigation.navigate('HealthAppSelection');
  };

  const handleManualEntry = () => {
    navigation.navigate('ManualActivity');
  };

  const getSourceName = (source: HealthAppType) => {
    switch (source) {
      case HealthAppType.APPLE_HEALTH:
        return 'Apple Health';
      case HealthAppType.GOOGLE_FIT:
        return 'Google Fit';
      case HealthAppType.SAMSUNG_HEALTH:
        return 'Samsung Health';
      case HealthAppType.HUAWEI_HEALTH:
        return 'Huawei Health';
      case HealthAppType.DEVICE_SENSORS:
        return 'Device Sensors';
      case HealthAppType.MANUAL:
        return 'Manual Entry';
      default:
        return 'Unknown';
    }
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m`;
    }
    return `${distance.toFixed(2)}km`;
  };

  if (!isConnected && !selectedApp) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏃‍♂️</Text>
          <Text style={styles.emptyTitle}>Track Your Activity</Text>
          <Text style={styles.emptySubtitle}>
            Connect a health app to automatically track your calories burned
          </Text>
          <TouchableOpacity
            style={styles.connectButton}
            onPress={handleConnectApp}
          >
            <Text style={styles.connectButtonText}>Connect Health App</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.manualButton}
            onPress={handleManualEntry}
          >
            <Text style={styles.manualButtonText}>Log Activity Manually</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Today's Activity</Text>
        {summary?.source && (
          <Text style={styles.source}>via {getSourceName(summary.source)}</Text>
        )}
      </View>

      {isLoading && !summary ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <>
          <View style={styles.mainStats}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statValue}>
                {summary?.totalCaloriesBurned || 0}
              </Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>👟</Text>
              <Text style={styles.statValue}>
                {summary?.totalSteps?.toLocaleString() || '0'}
              </Text>
              <Text style={styles.statLabel}>Steps</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📍</Text>
              <Text style={styles.statValue}>
                {summary?.totalDistance
                  ? formatDistance(summary.totalDistance)
                  : '0km'}
              </Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
          </View>

          {summary?.activities && summary.activities.length > 0 && (
            <View style={styles.activitiesSection}>
              <Text style={styles.sectionTitle}>Activity Breakdown</Text>
              {summary.activities.map((activity: any, index: number) => (
                <View key={index} style={styles.activityItem}>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityType}>
                      {activity.activityType || 'General Activity'}
                    </Text>
                    {activity.duration && (
                      <Text style={styles.activityDuration}>
                        {activity.duration} min
                      </Text>
                    )}
                  </View>
                  <Text style={styles.activityCalories}>
                    {activity.caloriesBurned} cal
                  </Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.addActivityButton}
            onPress={handleManualEntry}
          >
            <Text style={styles.addActivityText}>+ Add Manual Activity</Text>
          </TouchableOpacity>

          {summary?.lastSync && (
            <Text style={styles.lastSync}>
              Last synced: {new Date(summary.lastSync).toLocaleTimeString()}
            </Text>
          )}
        </>
      )}
    </ScrollView>
  );
};

export default ActivitySummary;
