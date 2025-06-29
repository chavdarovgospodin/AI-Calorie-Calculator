import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from './AuthContext';
import { apiClient } from '@/services/api';
import Constants from 'expo-constants';
import {
  ActivityData,
  HealthApp,
  HealthAppType,
} from '@/services/healthService/interfaces';
import HealthAppsManager from '@/services/healthService/HealthAppsManager';

interface ActivityContextType {
  availableApps: HealthApp[];
  selectedApp: HealthAppType | null;
  isConnected: boolean;
  isLoading: boolean;
  todayActivity: ActivityData | null;

  detectHealthApps: () => Promise<void>;
  selectHealthApp: (appType: HealthAppType) => Promise<boolean>;
  syncActivityData: () => Promise<void>;
  getActivitySummary: (date?: string) => Promise<any>;
  disconnectHealthApp: () => Promise<void>;
}

const ActivityContext = createContext<ActivityContextType | undefined>(
  undefined
);

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, user } = useAuth();
  const [availableApps, setAvailableApps] = useState<HealthApp[]>([]);
  const [selectedApp, setSelectedApp] = useState<HealthAppType | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [todayActivity, setTodayActivity] = useState<ActivityData | null>(null);

  // Load saved preferences on mount
  useEffect(() => {
    loadSavedPreferences();
  }, []);

  // Auto-detect apps when user logs in
  useEffect(() => {
    if (user) {
      detectHealthApps();
    }
  }, [user]);

  // Auto-sync when app is selected
  useEffect(() => {
    if (selectedApp && isConnected) {
      syncActivityData();
      // Set up periodic sync every 30 minutes
      const interval = setInterval(syncActivityData, 30 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [selectedApp, isConnected]);

  const loadSavedPreferences = async () => {
    try {
      const savedApp = await AsyncStorage.getItem('selectedHealthApp');
      const savedConnected = await AsyncStorage.getItem('healthAppConnected');

      if (savedApp) {
        setSelectedApp(savedApp as HealthAppType);
        setIsConnected(savedConnected === 'true');
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const isExpoGo = Constants?.appOwnership === 'expo';

  const detectHealthApps = useCallback(async () => {
    setIsLoading(true);
    try {
      const apps = await HealthAppsManager.detectAvailableApps();
      setAvailableApps(apps);

      if (isExpoGo) {
        console.log('Running in Expo Go - manual selection only');
        setIsLoading(false);
        return;
      }

      // Get preferences from backend if user is logged in
      if (isAuthenticated) {
        try {
          const { data } = await apiClient.get('/activity/preferences');
          if (data.preferredActivitySource) {
            const preferredApp = apps.find(
              app => app.type === data.preferredActivitySource
            );
            if (preferredApp && preferredApp.isAvailable) {
              await selectHealthApp(data.preferredActivitySource);
            }
          }
        } catch (error) {
          console.log('No saved preferences');
        }
      }
    } catch (error) {
      console.error('Failed to detect health apps:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const selectHealthApp = useCallback(
    async (appType: HealthAppType): Promise<boolean> => {
      setIsLoading(true);
      try {
        // Connect to the health app
        const connected = await HealthAppsManager.connectApp(appType);

        if (connected) {
          HealthAppsManager.setSelectedApp(appType);
          setSelectedApp(appType);
          setIsConnected(true);

          // Save to local storage
          await AsyncStorage.setItem('selectedHealthApp', appType);
          await AsyncStorage.setItem('healthAppConnected', 'true');

          // Update backend preferences if logged in
          if (isAuthenticated) {
            await apiClient.put('/activity/preferences', {
              preferredActivitySource: appType,
              enabledSources: [appType],
              autoSyncEnabled: true,
              syncFrequency: 'realtime',
            });
          }

          // Initial sync
          await syncActivityData();

          return true;
        }

        return false;
      } catch (error) {
        console.error('Failed to select health app:', error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  const syncActivityData = useCallback(async () => {
    if (!selectedApp || !isAuthenticated) return;

    try {
      // Get today's activity data from health app
      const activityData = await HealthAppsManager.getTodayActivityData();

      if (activityData) {
        setTodayActivity(activityData);

        // Sync to backend
        await apiClient.post('/activity/sync', {
          source: activityData.source,
          caloriesBurned: activityData.caloriesBurned,
          steps: activityData.steps,
          distance: activityData.distance,
          duration: activityData.duration,
          date: activityData.date,
          activityType: activityData.activityType,
        });
      }
    } catch (error) {
      console.error('Failed to sync activity data:', error);
    }
  }, [selectedApp, isAuthenticated]);

  const getActivitySummary = useCallback(
    async (date?: string) => {
      if (!isAuthenticated) return null;

      try {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const { data } = await apiClient.get(`/activity/summary/${targetDate}`);
        return data;
      } catch (error) {
        console.error('Failed to get activity summary:', error);
        return null;
      }
    },
    [isAuthenticated]
  );

  const disconnectHealthApp = useCallback(async () => {
    try {
      setSelectedApp(null);
      setIsConnected(false);
      setTodayActivity(null);

      await AsyncStorage.removeItem('selectedHealthApp');
      await AsyncStorage.removeItem('healthAppConnected');

      if (isAuthenticated) {
        await apiClient.put('/activity/preferences', {
          preferredActivitySource: null,
          enabledSources: [],
          autoSyncEnabled: false,
        });
      }
    } catch (error) {
      console.error('Failed to disconnect health app:', error);
    }
  }, [isAuthenticated]);

  const value: ActivityContextType = {
    availableApps,
    selectedApp,
    isConnected,
    isLoading,
    todayActivity,
    detectHealthApps,
    selectHealthApp,
    syncActivityData,
    getActivitySummary,
    disconnectHealthApp,
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within ActivityProvider');
  }
  return context;
};
