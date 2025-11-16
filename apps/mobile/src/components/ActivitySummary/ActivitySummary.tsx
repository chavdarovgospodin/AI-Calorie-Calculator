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
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';
import { HealthAppType } from '@/types';

interface ActivitySummaryProps {
  date?: string;
  onRefresh?: () => void;
}

const ActivitySummary: React.FC<ActivitySummaryProps> = ({
  date,
  onRefresh,
}) => {
  const navigation = useNavigation();

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
          <Ionicons name="walk-outline" size={60} color="#007AFF" />
          <Text style={styles.emptyTitle}>Track Your Activity</Text>
          <Text style={styles.emptySubtitle}>
            Connect a health app to automatically track your calories burned
          </Text>
          <TouchableOpacity
            style={styles.connectButton}
            onPress={handleConnectApp}
          >
            <Ionicons
              name="link-outline"
              size={18}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.connectButtonText}>Connect Health App</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.manualButton}
            onPress={handleManualEntry}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color="#007AFF"
              style={{ marginRight: 8 }}
            />
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
              <Ionicons name="flame-outline" size={28} color="#FF6B35" />
              <Text style={styles.statValue}>
                {summary?.totalCaloriesBurned || 0}
              </Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="footsteps-outline" size={28} color="#007AFF" />
              <Text style={styles.statValue}>
                {summary?.totalSteps?.toLocaleString() || '0'}
              </Text>
              <Text style={styles.statLabel}>Steps</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="location-outline" size={28} color="#34C759" />
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
              <Text style={styles.sectionTitle}>Recent Activities</Text>
              {summary.activities
                .slice(0, 3)
                .map((activity: any, index: number) => (
                  <View key={index} style={styles.activityItem}>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityName}>{activity.type}</Text>
                      <Text style={styles.activityDetails}>
                        {activity.duration} min • {activity.calories} cal
                      </Text>
                    </View>
                    <Text style={styles.activityTime}>
                      {new Date(activity.startTime).toLocaleTimeString(
                        'en-US',
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </Text>
                  </View>
                ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.manualEntryButton}
            onPress={handleManualEntry}
          >
            <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.manualEntryText}>Add Manual Activity</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

export default ActivitySummary;
