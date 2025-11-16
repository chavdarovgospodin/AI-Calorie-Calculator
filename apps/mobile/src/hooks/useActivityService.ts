import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { apiClient } from '@/services/api';
import {
  ActivityData,
  ActivitySource,
  ActivitySummary,
  HealthApp,
} from './interfaces';

export const useActivityService = () => {
  const [connectedApps, setConnectedApps] = useState<Set<ActivitySource>>(
    new Set()
  );

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  const initialize = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('connected_health_apps');
      if (stored) {
        const apps = JSON.parse(stored);
        setConnectedApps(new Set(apps));
      }
      console.log('🏃 Activity Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize activity service:', error);
    }
  }, []);

  // ============================================================================
  // DETECTION & CONNECTION
  // ============================================================================

  const checkAppInstalled = useCallback(
    async (packageName: string): Promise<boolean> => {
      try {
        // За демо целите, симулираме проверка
        // В реален проект би използвал react-native-installed-apps
        // или подобна библиотека
        return Math.random() > 0.5; // 50% шанс за да има разнообразие
      } catch (error) {
        console.error(`Failed to check if ${packageName} is installed:`, error);
        return false;
      }
    },
    []
  );

  const detectAvailableApps = useCallback(async (): Promise<HealthApp[]> => {
    const apps: HealthApp[] = [];

    if (Platform.OS === 'android') {
      // Google Fit
      apps.push({
        source: ActivitySource.GOOGLE_FIT,
        name: 'Google Fit',
        description: 'Tracks steps, workouts, and health metrics',
        isInstalled: await checkAppInstalled('com.google.android.apps.fitness'),
        isConnected: connectedApps.has(ActivitySource.GOOGLE_FIT),
        packageName: 'com.google.android.apps.fitness',
        icon: '🏃‍♂️',
      });

      // Samsung Health
      if (Device.brand === 'samsung') {
        apps.push({
          source: ActivitySource.SAMSUNG_HEALTH,
          name: 'Samsung Health',
          description: 'Comprehensive health and fitness tracking',
          isInstalled: await checkAppInstalled('com.sec.android.app.shealth'),
          isConnected: connectedApps.has(ActivitySource.SAMSUNG_HEALTH),
          packageName: 'com.sec.android.app.shealth',
          icon: '💚',
        });
      }

      // Huawei Health (популярен в България)
      if (Device.brand === 'Huawei' || Device.brand === 'HUAWEI') {
        apps.push({
          source: ActivitySource.HUAWEI_HEALTH,
          name: 'Huawei Health',
          description: 'Professional health management',
          isInstalled: await checkAppInstalled('com.huawei.health'),
          isConnected: connectedApps.has(ActivitySource.HUAWEI_HEALTH),
          packageName: 'com.huawei.health',
          icon: '❤️',
        });
      }
    } else if (Platform.OS === 'ios') {
      // Apple Health (APPLE_HEALTH)
      apps.push({
        source: ActivitySource.APPLE_HEALTH,
        name: 'Apple Health',
        description: 'Central health and fitness hub for iOS',
        isInstalled: true, // Always available on iOS
        isConnected: connectedApps.has(ActivitySource.APPLE_HEALTH),
        icon: '🍎',
      });
    }

    // Device sensors (всички устройства)
    apps.push({
      source: ActivitySource.DEVICE_SENSORS,
      name: 'Device Sensors',
      description: 'Built-in step counter and motion sensors',
      isInstalled: true,
      isConnected: connectedApps.has(ActivitySource.DEVICE_SENSORS),
      icon: '📱',
    });

    // Manual entry (винаги налично)
    apps.push({
      source: ActivitySource.MANUAL,
      name: 'Manual Entry',
      description: 'Manually log your activities and workouts',
      isInstalled: true,
      isConnected: connectedApps.has(ActivitySource.MANUAL),
      icon: '✍️',
    });

    console.log('📱 Detected health apps:', apps.length);
    return apps;
  }, [connectedApps, checkAppInstalled]);

  // ============================================================================
  // STORAGE HELPERS
  // ============================================================================

  const saveConnectedApps = useCallback(async (apps: Set<ActivitySource>) => {
    try {
      const appsArray = Array.from(apps);
      await AsyncStorage.setItem(
        'connected_health_apps',
        JSON.stringify(appsArray)
      );
      setConnectedApps(apps);
    } catch (error) {
      console.error('Failed to save connected apps:', error);
    }
  }, []);

  // ============================================================================
  // CONNECTION METHODS
  // ============================================================================

  const connectGoogleFit = useCallback(async (): Promise<boolean> => {
    // TODO: Implement Google Fit API integration
    console.log('🟢 Google Fit connection simulated');
    const newConnectedApps = new Set(connectedApps);
    newConnectedApps.add(ActivitySource.GOOGLE_FIT);
    await saveConnectedApps(newConnectedApps);
    return true;
  }, [connectedApps, saveConnectedApps]);

  const connectSamsungHealth = useCallback(async (): Promise<boolean> => {
    // TODO: Implement Samsung Health SDK integration
    console.log('💚 Samsung Health connection simulated');
    const newConnectedApps = new Set(connectedApps);
    newConnectedApps.add(ActivitySource.SAMSUNG_HEALTH);
    await saveConnectedApps(newConnectedApps);
    return true;
  }, [connectedApps, saveConnectedApps]);

  const connectHuaweiHealth = useCallback(async (): Promise<boolean> => {
    // TODO: Implement Huawei Health SDK integration
    console.log('❤️ Huawei Health connection simulated');
    const newConnectedApps = new Set(connectedApps);
    newConnectedApps.add(ActivitySource.HUAWEI_HEALTH);
    await saveConnectedApps(newConnectedApps);
    return true;
  }, [connectedApps, saveConnectedApps]);

  const connectHealthKit = useCallback(async (): Promise<boolean> => {
    // TODO: Implement HealthKit integration
    console.log('🍎 HealthKit connection simulated');
    const newConnectedApps = new Set(connectedApps);
    newConnectedApps.add(ActivitySource.APPLE_HEALTH);
    await saveConnectedApps(newConnectedApps);
    return true;
  }, [connectedApps, saveConnectedApps]);

  const connectDeviceSensors = useCallback(async (): Promise<boolean> => {
    // TODO: Implement device sensors (pedometer, motion)
    console.log('📱 Device sensors enabled');
    const newConnectedApps = new Set(connectedApps);
    newConnectedApps.add(ActivitySource.DEVICE_SENSORS);
    await saveConnectedApps(newConnectedApps);
    return true;
  }, [connectedApps, saveConnectedApps]);

  const enableManualEntry = useCallback(async (): Promise<boolean> => {
    console.log('✍️ Manual entry enabled');
    const newConnectedApps = new Set(connectedApps);
    newConnectedApps.add(ActivitySource.MANUAL);
    await saveConnectedApps(newConnectedApps);
    return true;
  }, [connectedApps, saveConnectedApps]);

  const connectToApp = useCallback(
    async (source: ActivitySource): Promise<boolean> => {
      try {
        console.log(`🔗 Connecting to ${source}...`);

        // Симулираме connection процеса
        await new Promise(resolve => setTimeout(resolve, 1000));

        switch (source) {
          case ActivitySource.GOOGLE_FIT:
            return await connectGoogleFit();
          case ActivitySource.SAMSUNG_HEALTH:
            return await connectSamsungHealth();
          case ActivitySource.HUAWEI_HEALTH:
            return await connectHuaweiHealth();
          case ActivitySource.APPLE_HEALTH:
            return await connectHealthKit();
          case ActivitySource.DEVICE_SENSORS:
            return await connectDeviceSensors();
          case ActivitySource.MANUAL:
            return await enableManualEntry();
          default:
            throw new Error(`Unsupported source: ${source}`);
        }
      } catch (error) {
        console.error(`❌ Failed to connect to ${source}:`, error);
        return false;
      }
    },
    [
      connectGoogleFit,
      connectSamsungHealth,
      connectHuaweiHealth,
      connectHealthKit,
      connectDeviceSensors,
      enableManualEntry,
    ]
  );

  const disconnectFromApp = useCallback(
    async (source: ActivitySource): Promise<boolean> => {
      try {
        console.log(`🔌 Disconnecting from ${source}...`);

        const newConnectedApps = new Set(connectedApps);
        newConnectedApps.delete(source);
        await saveConnectedApps(newConnectedApps);

        console.log(`✅ Disconnected from ${source}`);
        return true;
      } catch (error) {
        console.error(`❌ Failed to disconnect from ${source}:`, error);
        return false;
      }
    },
    [connectedApps, saveConnectedApps]
  );

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchActivityFromSource = useCallback(
    async (
      source: ActivitySource,
      date: string
    ): Promise<ActivityData | null> => {
      // Симулираме данни от различни източници
      const mockData: Record<ActivitySource, Partial<ActivityData>> = {
        [ActivitySource.GOOGLE_FIT]: {
          caloriesBurned: 450,
          steps: 8500,
          distance: 6.2,
          activityType: 'walking',
        },
        [ActivitySource.SAMSUNG_HEALTH]: {
          caloriesBurned: 380,
          steps: 7200,
          distance: 5.1,
          activityType: 'mixed',
        },
        [ActivitySource.HUAWEI_HEALTH]: {
          caloriesBurned: 520,
          steps: 9100,
          distance: 7.3,
          activityType: 'running',
        },
        [ActivitySource.APPLE_HEALTH]: {
          caloriesBurned: 410,
          steps: 8000,
          distance: 5.8,
          activityType: 'walking',
        },
        [ActivitySource.DEVICE_SENSORS]: {
          caloriesBurned: 200,
          steps: 4500,
          distance: 3.2,
          activityType: 'basic',
        },
        [ActivitySource.MANUAL]: {
          caloriesBurned: 0,
          steps: 0,
          distance: 0,
        },
      };

      const baseData = mockData[source];
      if (!baseData) return null;

      return {
        source,
        date,
        externalId: `${source}_${date}_${Date.now()}`,
        ...baseData,
      } as ActivityData;
    },
    []
  );

  const syncActivityData = useCallback(
    async (date?: string): Promise<ActivitySummary> => {
      try {
        const targetDate = date || new Date().toISOString().split('T')[0];
        console.log(`🔄 Syncing activity data for ${targetDate}...`);

        const activities: ActivityData[] = [];
        let totalCaloriesBurned = 0;
        let totalSteps = 0;
        let totalDistance = 0;

        // Sync from each connected app
        for (const source of connectedApps) {
          try {
            const data = await fetchActivityFromSource(source, targetDate);
            if (data) {
              activities.push(data);
              totalCaloriesBurned += data.caloriesBurned;
              totalSteps += data.steps || 0;
              totalDistance += data.distance || 0;
            }
          } catch (error) {
            console.error(`Failed to sync from ${source}:`, error);
          }
        }

        const summary: ActivitySummary = {
          date: targetDate,
          totalCaloriesBurned: Math.round(totalCaloriesBurned),
          totalSteps: Math.round(totalSteps),
          totalDistance: Math.round(totalDistance * 100) / 100,
          activities,
          lastSync: new Date().toISOString(),
          source: activities.length > 0 ? activities[0].source : null,
        };

        console.log(
          `✅ Activity sync complete: ${totalCaloriesBurned} cal, ${totalSteps} steps`
        );
        return summary;
      } catch (error) {
        console.error('❌ Activity sync failed:', error);
        throw error;
      }
    },
    [connectedApps, fetchActivityFromSource]
  );

  // ============================================================================
  // MANUAL ACTIVITY
  // ============================================================================

  const calculateCaloriesFromActivity = useCallback(
    (activity: {
      activityType: string;
      duration: number;
      intensity: 'low' | 'moderate' | 'high';
    }): number => {
      // Базови калории per минута за различни дейности
      const calorieRates: Record<string, Record<string, number>> = {
        walking: { low: 3, moderate: 4, high: 5 },
        running: { low: 8, moderate: 10, high: 12 },
        cycling: { low: 5, moderate: 7, high: 9 },
        swimming: { low: 6, moderate: 8, high: 11 },
        gym: { low: 4, moderate: 6, high: 8 },
        yoga: { low: 2, moderate: 3, high: 4 },
        dancing: { low: 3, moderate: 5, high: 7 },
        default: { low: 3, moderate: 4, high: 5 },
      };

      const activityType = activity.activityType.toLowerCase();
      const rates = calorieRates[activityType] || calorieRates.default;
      const rate = rates[activity.intensity];

      return Math.round(rate * activity.duration);
    },
    []
  );

  const addManualActivity = useCallback(
    async (activity: {
      activityType: string;
      duration: number;
      intensity: 'low' | 'moderate' | 'high';
      caloriesBurned?: number;
      notes?: string;
      date?: string;
    }): Promise<ActivityData> => {
      try {
        const calculatedCalories =
          activity.caloriesBurned || calculateCaloriesFromActivity(activity);

        const activityData: ActivityData = {
          source: ActivitySource.MANUAL,
          caloriesBurned: calculatedCalories,
          duration: activity.duration,
          activityType: activity.activityType,
          date: activity.date || new Date().toISOString().split('T')[0],
        };

        console.log(
          `✅ Manual activity added: ${activity.activityType} - ${calculatedCalories} cal`
        );
        return activityData;
      } catch (error) {
        console.error('❌ Failed to add manual activity:', error);
        throw error;
      }
    },
    [calculateCaloriesFromActivity]
  );

  // ============================================================================
  // BACKEND API INTEGRATION
  // ============================================================================

  const syncToBackend = useCallback(
    async (activityData: ActivityData): Promise<void> => {
      try {
        const response = await apiClient.post('/activity/sync', {
          source: activityData.source,
          caloriesBurned: activityData.caloriesBurned,
          steps: activityData.steps,
          distance: activityData.distance,
          duration: activityData.duration,
          externalId: activityData.externalId,
          activityType: activityData.activityType,
          date: activityData.date,
        });
        console.log('✅ Activity synced to backend');
        return response.data;
      } catch (error) {
        console.error('❌ Failed to sync activity to backend:', error);
        throw error;
      }
    },
    []
  );

  const getActivitySummary = useCallback(
    async (date?: string): Promise<ActivitySummary> => {
      try {
        const params = date ? { date } : {};
        const response = await apiClient.get('/activity/summary', { params });
        return response.data;
      } catch (error) {
        console.error('❌ Failed to get activity summary:', error);
        throw error;
      }
    },
    []
  );

  const addManualActivityToBackend = useCallback(
    async (activity: {
      activityType: string;
      duration: number;
      intensity: 'low' | 'moderate' | 'high';
      caloriesBurned?: number;
      notes?: string;
      date?: string;
    }): Promise<any> => {
      try {
        const response = await apiClient.post('/activity/manual', activity);
        console.log('✅ Manual activity added via backend');
        return response.data;
      } catch (error) {
        console.error('❌ Failed to add manual activity:', error);
        throw error;
      }
    },
    []
  );

  const getAvailableActivitySources = useCallback(
    async (platform: 'ios' | 'android'): Promise<any[]> => {
      try {
        const response = await apiClient.get(`/activity/sources/${platform}`);
        return response.data;
      } catch (error) {
        console.error('❌ Failed to get activity sources:', error);
        throw error;
      }
    },
    []
  );

  const updateActivityPreferences = useCallback(
    async (preferences: {
      preferredActivitySource?: ActivitySource;
      enabledSources?: ActivitySource[];
      autoSyncEnabled?: boolean;
      syncFrequency?: 'realtime' | 'hourly' | 'daily';
      activityGoal?: number;
    }): Promise<any> => {
      try {
        const response = await apiClient.put(
          '/activity/preferences',
          preferences
        );
        console.log('✅ Activity preferences updated');
        return response.data;
      } catch (error) {
        console.error('❌ Failed to update activity preferences:', error);
        throw error;
      }
    },
    []
  );

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  const getConnectedApps = useCallback((): ActivitySource[] => {
    return Array.from(connectedApps);
  }, [connectedApps]);

  const hasConnectedApps = useCallback((): boolean => {
    return connectedApps.size > 0;
  }, [connectedApps]);

  // ============================================================================
  // RETURN ALL METHODS
  // ============================================================================

  return {
    // Initialization
    initialize,

    // Detection & Connection
    detectAvailableApps,
    connectToApp,
    disconnectFromApp,

    // Data Syncing
    syncActivityData,
    fetchActivityFromSource,

    // Manual Activity
    addManualActivity,
    calculateCaloriesFromActivity,

    // Backend API
    syncToBackend,
    getActivitySummary,
    addManualActivityToBackend,
    getAvailableActivitySources,
    updateActivityPreferences,

    // Utilities
    getConnectedApps,
    hasConnectedApps,
  };
};
