import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import services
import * as activityApi from '@/services/activity';
import * as deviceHealth from '@/services/deviceHealth';

// Import types from services (temporary until we move to types/health.ts)
import type { ActivitySource, ActivitySummary } from '@/services/activity';
import type {
  HealthApp,
  HealthAppType,
  ActivityData,
} from '@/services/deviceHealth';

export const useActivityService = () => {
  const [connectedApps, setConnectedApps] = useState<Set<HealthAppType>>(
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
  // DETECTION & CONNECTION (uses deviceHealth service)
  // ============================================================================

  const detectAvailableApps = useCallback(async (): Promise<HealthApp[]> => {
    try {
      const apps = await deviceHealth.detectAvailableHealthApps();

      // Update connection status based on stored connected apps
      const appsWithConnectionStatus = apps.map(app => ({
        ...app,
        isConnected: connectedApps.has(app.source),
      }));

      return appsWithConnectionStatus;
    } catch (error) {
      console.error('Failed to detect apps:', error);
      return [];
    }
  }, [connectedApps]);

  const connectToApp = useCallback(
    async (appType: HealthAppType): Promise<boolean> => {
      try {
        const success = await deviceHealth.connectToHealthApp(appType);

        if (success) {
          const newConnectedApps = new Set(connectedApps);
          newConnectedApps.add(appType);
          setConnectedApps(newConnectedApps);

          // Save to storage
          const appsArray = Array.from(newConnectedApps);
          await AsyncStorage.setItem(
            'connected_health_apps',
            JSON.stringify(appsArray)
          );
        }

        return success;
      } catch (error) {
        console.error(`Failed to connect to ${appType}:`, error);
        return false;
      }
    },
    [connectedApps]
  );

  const disconnectFromApp = useCallback(
    async (appType: HealthAppType): Promise<boolean> => {
      try {
        const newConnectedApps = new Set(connectedApps);
        newConnectedApps.delete(appType);
        setConnectedApps(newConnectedApps);

        // Save to storage
        const appsArray = Array.from(newConnectedApps);
        await AsyncStorage.setItem(
          'connected_health_apps',
          JSON.stringify(appsArray)
        );

        console.log(`✅ Disconnected from ${appType}`);
        return true;
      } catch (error) {
        console.error(`Failed to disconnect from ${appType}:`, error);
        return false;
      }
    },
    [connectedApps]
  );

  // ============================================================================
  // DATA RETRIEVAL (uses deviceHealth service)
  // ============================================================================

  const getTodayActivityData = useCallback(
    async (appType: HealthAppType): Promise<ActivityData | null> => {
      try {
        return await deviceHealth.getTodayActivityData(appType);
      } catch (error) {
        console.error('Failed to get activity data:', error);
        return null;
      }
    },
    []
  );

  // ============================================================================
  // BACKEND API (uses activity service)
  // ============================================================================

  const syncToBackend = useCallback(
    async (activityData: ActivityData): Promise<void> => {
      // Convert HealthAppType to ActivitySource (they're compatible)
      const syncData: activityApi.ActivitySyncData = {
        source: activityData.source as unknown as activityApi.ActivitySource,
        caloriesBurned: activityData.caloriesBurned,
        steps: activityData.steps,
        distance: activityData.distance,
        duration: activityData.duration,
        activityType: activityData.activityType,
        date: activityData.date,
      };

      return await activityApi.syncActivityToBackend(syncData);
    },
    []
  );

  const getActivitySummary = useCallback(
    async (date?: string): Promise<ActivitySummary> => {
      return await activityApi.getActivitySummary(date);
    },
    []
  );

  const addManualActivity = useCallback(
    async (activity: activityApi.ManualActivityInput): Promise<any> => {
      return await activityApi.addManualActivity(activity);
    },
    []
  );

  const getAvailableActivitySources = useCallback(
    async (platform: 'ios' | 'android'): Promise<any[]> => {
      return await activityApi.getAvailableActivitySources(platform);
    },
    []
  );

  const updateActivityPreferences = useCallback(
    async (preferences: activityApi.ActivityPreferences): Promise<any> => {
      return await activityApi.updateActivityPreferences(preferences);
    },
    []
  );

  const getActivityPreferences =
    useCallback(async (): Promise<activityApi.ActivityPreferences> => {
      return await activityApi.getActivityPreferences();
    }, []);

  // ============================================================================
  // UTILITY
  // ============================================================================

  const calculateCaloriesFromActivity = useCallback(
    (activity: {
      activityType: string;
      duration: number;
      intensity: 'low' | 'moderate' | 'high';
    }): number => {
      return deviceHealth.calculateCaloriesFromActivity(activity);
    },
    []
  );

  const getConnectedApps = useCallback((): HealthAppType[] => {
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

    // Detection & Connection (deviceHealth)
    detectAvailableApps,
    connectToApp,
    disconnectFromApp,
    getTodayActivityData,

    // Backend API (activityApi)
    syncToBackend,
    getActivitySummary,
    addManualActivity,
    getAvailableActivitySources,
    updateActivityPreferences,
    getActivityPreferences,

    // Utilities
    calculateCaloriesFromActivity,
    getConnectedApps,
    hasConnectedApps,
  };
};
