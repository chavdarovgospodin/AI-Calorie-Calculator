import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { apiClient } from '@/services/api';

import { useHealthApps } from '@/hooks/useHealthApps';
import { ActivityData, HealthApp, HealthAppType } from '@/hooks/interfaces';

interface ActivityState {
  availableApps: AvailableApp[];
  selectedApp: ActivitySource | null;
  isConnected: boolean;
  isLoading: boolean;
  todayActivity: ActivitySummary | null;
  error: string | null;
}

type ActivityAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AVAILABLE_APPS'; payload: AvailableApp[] }
  | { type: 'SET_SELECTED_APP'; payload: ActivitySource | null }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_TODAY_ACTIVITY'; payload: ActivitySummary | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

interface ActivityContextType extends ActivityState {
  detectHealthApps: () => Promise<AvailableApp[]>;
  selectHealthApp: (app: ActivitySource) => Promise<void>;
  syncActivityData: (date?: string) => Promise<ActivitySummary | null>;
  getActivitySummary: (date?: string) => Promise<ActivitySummary | null>;
  addManualActivity: (activity: {
    activityType: string;
    duration: number;
    intensity: 'low' | 'moderate' | 'high';
    caloriesBurned?: number;
    notes?: string;
    date?: string;
  }) => Promise<void>;
  disconnectHealthApp: () => Promise<void>;
  clearError: () => void;
}

const initialState: ActivityState = {
  availableApps: [],
  selectedApp: null,
  isConnected: false,
  isLoading: false,
  todayActivity: null,
  error: null,
};

const activityReducer = (
  state: ActivityState,
  action: ActivityAction
): ActivityState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_AVAILABLE_APPS':
      return { ...state, availableApps: action.payload };
    case 'SET_SELECTED_APP':
      return { ...state, selectedApp: action.payload };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'SET_TODAY_ACTIVITY':
      return { ...state, todayActivity: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const ActivityContext = createContext<ActivityContextType | undefined>(
  undefined
);

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, user } = useAuth();
  const healthApps = useHealthApps();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [todayActivity, setTodayActivity] = useState<ActivityData | null>(null);
  const syncInProgressRef = useRef(false);
  const lastSyncDateRef = useRef<string | null>(null);

  const detectHealthApps = useCallback(async () => {
    setIsLoading(true);
    try {
      const apps = await healthApps.detectAvailableApps();

      // Get preferences from backend if user is logged in
      if (isAuthenticated) {
        try {
          const { data } = await apiClient.get('/activity/preferences');
          if (data.preferredActivitySource) {
            const preferredApp = apps.find(
              app => app.source === data.preferredActivitySource
            );
            if (preferredApp && preferredApp.isAvailable) {
              // Connect to the health app
              const connected = await healthApps.connectApp(
                data.preferredActivitySource
              );

              if (connected) {
                healthApps.setSelectedApp(data.preferredActivitySource);
                setIsConnected(true);
                await AsyncStorage.setItem(
                  'selectedHealthApp',
                  data.preferredActivitySource
                );
                await AsyncStorage.setItem('healthAppConnected', 'true');
              }
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
  }, [isAuthenticated]); // Simplified dependencies - functions from healthApps hook are stable

  const selectHealthApp = useCallback(
    async (appType: HealthAppType): Promise<boolean> => {
      setIsLoading(true);
      try {
        // Connect to the health app
        const connected = await healthApps.connectApp(appType);

        if (connected) {
          healthApps.setSelectedApp(appType);
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

          // Initial sync will be triggered by useEffect
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
    [isAuthenticated] // Simplified - healthApps functions are stable
  );

  const syncActivityData = useCallback(async () => {
    const currentSelectedApp = healthApps.selectedApp;
    if (!currentSelectedApp || !isAuthenticated) return;

    // Prevent concurrent syncs
    if (syncInProgressRef.current) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    // Prevent multiple syncs for the same day
    if (lastSyncDateRef.current === today) {
      console.log('Already synced today, skipping...');
      return;
    }

    syncInProgressRef.current = true;
    try {
      // Get today's activity data from health app
      const activityData = await healthApps.getTodayActivityData();

      if (savedApp && isConnectedStr === 'true') {
        dispatch({
          type: 'SET_SELECTED_APP',
          payload: savedApp as ActivitySource,
        });

        lastSyncDateRef.current = today;
      }
    } catch (error) {
      console.error('Failed to sync activity data:', error);
    } finally {
      syncInProgressRef.current = false;
    }
  }, [isAuthenticated]); // Simplified - capture healthApps.selectedApp in closure

  const detectHealthApps = useCallback(async (): Promise<AvailableApp[]> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const platform =
        Platform.OS === 'ios' || Platform.OS === 'android'
          ? Platform.OS
          : 'android';
      const apps =
        await unifiedActivityService.getAvailableActivitySources(platform);
      dispatch({ type: 'SET_AVAILABLE_APPS', payload: apps });

      return apps;
    } catch (error) {
      console.error('Failed to detect health apps:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to detect health apps' });
      return [];
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const selectHealthApp = useCallback(
    async (app: ActivitySource): Promise<void> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        await unifiedActivityService.connectApp(app);

        await Promise.all([
          AsyncStorage.setItem('selectedHealthApp', app),
          AsyncStorage.setItem('healthAppConnected', 'true'),
        ]);

        dispatch({ type: 'SET_SELECTED_APP', payload: app });
        dispatch({ type: 'SET_CONNECTED', payload: true });

        // Sync today's data
        await syncActivityData();
      } catch (error) {
        console.error('Failed to select health app:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to connect to health app',
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    []
  );

  const syncActivityData = useCallback(
    async (date?: string): Promise<ActivitySummary | null> => {
      if (!isAuthenticated) return null;

      try {
        dispatch({ type: 'CLEAR_ERROR' });

        const summary = await unifiedActivityService.syncActivityData(date);

        if (!date || date === new Date().toISOString().split('T')[0]) {
          dispatch({ type: 'SET_TODAY_ACTIVITY', payload: summary });
        }

        return summary;
      } catch (error) {
        console.error('Failed to sync activity data:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to sync activity data',
        });
        return null;
      }
    },
    [isAuthenticated]
  );

  const disconnectHealthApp = useCallback(async () => {
    try {
      healthApps.setSelectedApp(null);
      setIsConnected(false);
      setTodayActivity(null);

      try {
        dispatch({ type: 'CLEAR_ERROR' });
        return await unifiedActivityService.getActivitySummary(date);
      } catch (error) {
        console.error('Failed to get activity summary:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to get activity summary',
        });
        return null;
      }
    },
    [isAuthenticated]
  );

  const addManualActivity = useCallback(
    async (activity: {
      activityType: string;
      duration: number;
      intensity: 'low' | 'moderate' | 'high';
      caloriesBurned?: number;
      notes?: string;
      date?: string;
    }): Promise<void> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        await unifiedActivityService.addManualActivity(activity);

        // Refresh today's data if adding for today
        const targetDate =
          activity.date || new Date().toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];

        if (targetDate === today) {
          await syncActivityData();
        }
      } catch (error) {
        console.error('Failed to add manual activity:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to add manual activity',
        });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [syncActivityData]
  );

  const disconnectHealthApp = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      await unifiedActivityService.disconnectAllApps();

      dispatch({ type: 'SET_SELECTED_APP', payload: null });
      dispatch({ type: 'SET_CONNECTED', payload: false });
      dispatch({ type: 'SET_TODAY_ACTIVITY', payload: null });
    } catch (error) {
      console.error('Failed to disconnect health app:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to disconnect health app',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated]); // Simplified - healthApps.setSelectedApp is stable

  // Load saved preferences on mount (only once)
  useEffect(() => {
    let isMounted = true;

    const loadPrefs = async () => {
      setIsLoading(true);
      try {
        const savedApp = await AsyncStorage.getItem('selectedHealthApp');
        const savedConnected = await AsyncStorage.getItem('healthAppConnected');

        if (isMounted && savedApp) {
          healthApps.setSelectedApp(savedApp as HealthAppType);
          setIsConnected(savedConnected === 'true');
          console.log('✅ Loaded saved health app preference:', savedApp);
        } else if (isMounted) {
          console.log('ℹ️ No saved health app preference found');
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPrefs();

    return () => {
      isMounted = false;
    };
  }, []); // Empty deps - only run once on mount

  // Auto-detect apps when user logs in
  useEffect(() => {
    if (!user || !isAuthenticated) return;

    let isMounted = true;

    const detect = async () => {
      setIsLoading(true);
      try {
        const apps = await healthApps.detectAvailableApps();

        // Get preferences from backend if user is logged in
        if (isMounted && isAuthenticated) {
          try {
            const { data } = await apiClient.get('/activity/preferences');
            if (data.preferredActivitySource) {
              const preferredApp = apps.find(
                app => app.source === data.preferredActivitySource
              );
              if (preferredApp && preferredApp.isAvailable) {
                // Connect to the health app
                const connected = await healthApps.connectApp(
                  data.preferredActivitySource
                );

                if (isMounted && connected) {
                  healthApps.setSelectedApp(data.preferredActivitySource);
                  setIsConnected(true);
                  await AsyncStorage.setItem(
                    'selectedHealthApp',
                    data.preferredActivitySource
                  );
                  await AsyncStorage.setItem('healthAppConnected', 'true');
                }
              }
            }
          } catch (error) {
            console.log('No saved preferences');
          }
        }
      } catch (error) {
        console.error('Failed to detect health apps:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    detect();

    return () => {
      isMounted = false;
    };
  }, [user?.id, isAuthenticated]); // Only depend on user.id, not the whole user object

  // Auto-sync when app is selected (only once when connection is established)
  useEffect(() => {
    if (
      !healthApps.selectedApp ||
      !isConnected ||
      syncInProgressRef.current ||
      !isAuthenticated
    ) {
      return;
    }

    // Only sync once when app is selected, not on every dependency change
    let intervalId: NodeJS.Timeout | null = null;
    let isMounted = true;

    const performInitialSync = async () => {
      if (!isMounted) return;

      const currentSelectedApp = healthApps.selectedApp;
      if (!currentSelectedApp) return;

      // Prevent concurrent syncs
      if (syncInProgressRef.current) {
        console.log('Sync already in progress, skipping...');
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      // Prevent multiple syncs for the same day
      if (lastSyncDateRef.current === today) {
        console.log('Already synced today, skipping...');
        return;
      }

      syncInProgressRef.current = true;
      try {
        // Get today's activity data from health app
        const activityData = await healthApps.getTodayActivityData();

        if (isMounted && activityData) {
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

          lastSyncDateRef.current = today;
        }
      } catch (error) {
        console.error('Initial sync failed:', error);
      } finally {
        syncInProgressRef.current = false;
      }

      if (isMounted) {
        // Set up periodic sync every 30 minutes
        intervalId = setInterval(
          async () => {
            if (
              !syncInProgressRef.current &&
              isMounted &&
              healthApps.selectedApp
            ) {
              const todayCheck = new Date().toISOString().split('T')[0];
              if (lastSyncDateRef.current !== todayCheck) {
                syncInProgressRef.current = true;
                try {
                  const activityData = await healthApps.getTodayActivityData();
                  if (isMounted && activityData) {
                    setTodayActivity(activityData);
                    await apiClient.post('/activity/sync', {
                      source: activityData.source,
                      caloriesBurned: activityData.caloriesBurned,
                      steps: activityData.steps,
                      distance: activityData.distance,
                      duration: activityData.duration,
                      date: activityData.date,
                      activityType: activityData.activityType,
                    });
                    lastSyncDateRef.current = todayCheck;
                  }
                } catch (error) {
                  console.error('Periodic sync failed:', error);
                } finally {
                  syncInProgressRef.current = false;
                }
              }
            }
          },
          30 * 60 * 1000
        );
      }
    };

    performInitialSync();

    // Cleanup function
    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [
    healthApps.selectedApp,
    isConnected,
    isAuthenticated,
    healthApps.getTodayActivityData,
  ]);

  const value: ActivityContextType = {
    availableApps: healthApps.availableApps,
    selectedApp: healthApps.selectedApp,
    isConnected,
    isLoading,
    todayActivity,
    detectHealthApps,
    selectHealthApp,
    syncActivityData,
    getActivitySummary,
    addManualActivity,
    disconnectHealthApp,
    clearError,
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = (): ActivityContextType => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within ActivityProvider');
  }
  return context;
};
