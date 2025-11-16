import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import contexts
import { useAuth } from './AuthContext';

// Import hooks
import { useHealthApps } from '@/hooks/useHealthApps';

// Import services
import * as activityApi from '@/services/activity';
import * as deviceHealth from '@/services/deviceHealth';

// Import types
import type {
  HealthAppType,
  HealthApp,
  ActivityData,
} from '@/services/deviceHealth';
import type { ActivitySummary, ManualActivityInput } from '@/services/activity';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ActivityState {
  availableApps: HealthApp[];
  selectedApp: HealthAppType | null;
  isConnected: boolean;
  isLoading: boolean;
  todayActivity: ActivityData | null;
  error: string | null;
}

type ActivityAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AVAILABLE_APPS'; payload: HealthApp[] }
  | { type: 'SET_SELECTED_APP'; payload: HealthAppType | null }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_TODAY_ACTIVITY'; payload: ActivityData | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

interface ActivityContextType extends ActivityState {
  detectHealthApps: () => Promise<HealthApp[]>;
  selectHealthApp: (app: HealthAppType) => Promise<void>;
  syncActivityData: (date?: string) => Promise<void>;
  getActivitySummary: (date?: string) => Promise<ActivitySummary | null>;
  addManualActivity: (activity: ManualActivityInput) => Promise<void>;
  disconnectHealthApp: () => Promise<void>;
  clearError: () => void;
}

// ============================================================================
// REDUCER
// ============================================================================

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

// ============================================================================
// CONTEXT
// ============================================================================

const ActivityContext = createContext<ActivityContextType | undefined>(
  undefined
);

// ============================================================================
// PROVIDER
// ============================================================================

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(activityReducer, initialState);
  const { isAuthenticated } = useAuth();
  const healthApps = useHealthApps();

  const syncInProgressRef = useRef(false);
  const lastSyncDateRef = useRef<string | null>(null);

  // ============================================================================
  // LOAD SAVED PREFERENCES
  // ============================================================================

  useEffect(() => {
    const loadSavedSettings = async () => {
      try {
        const [savedApp, isConnectedStr] = await Promise.all([
          AsyncStorage.getItem('selectedHealthApp'),
          AsyncStorage.getItem('healthAppConnected'),
        ]);

        if (savedApp && isConnectedStr === 'true') {
          dispatch({
            type: 'SET_SELECTED_APP',
            payload: savedApp as HealthAppType,
          });
          dispatch({ type: 'SET_CONNECTED', payload: true });

          // Set in healthApps hook as well
          healthApps.setSelectedApp(savedApp as HealthAppType);

          console.log('✅ Loaded saved health app preference:', savedApp);
        }
      } catch (error) {
        console.error('Failed to load saved settings:', error);
      }
    };

    if (isAuthenticated) {
      loadSavedSettings();
    }
  }, [isAuthenticated, healthApps]);

  // ============================================================================
  // AUTO SYNC
  // ============================================================================

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const performSync = async () => {
      if (!state.selectedApp || !state.isConnected || !isAuthenticated) {
        return;
      }

      if (syncInProgressRef.current) {
        console.log('Sync already in progress, skipping...');
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      if (lastSyncDateRef.current === today) {
        console.log('Already synced today, skipping...');
        return;
      }

      syncInProgressRef.current = true;
      try {
        const activityData = await healthApps.getTodayActivityData();

        if (activityData) {
          dispatch({ type: 'SET_TODAY_ACTIVITY', payload: activityData });

          // Sync to backend
          await activityApi.syncActivityToBackend({
            source: activityData.source as any, // Type conversion
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
        console.error('Auto sync failed:', error);
      } finally {
        syncInProgressRef.current = false;
      }
    };

    if (state.selectedApp && state.isConnected && isAuthenticated) {
      // Initial sync
      performSync();

      // Set up interval for periodic sync (every 30 minutes)
      intervalId = setInterval(performSync, 30 * 60 * 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [state.selectedApp, state.isConnected, isAuthenticated, healthApps]);

  // ============================================================================
  // DETECT HEALTH APPS
  // ============================================================================

  const detectHealthApps = useCallback(async (): Promise<HealthApp[]> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const apps = await healthApps.detectAvailableApps();
      dispatch({ type: 'SET_AVAILABLE_APPS', payload: apps });

      // Get preferences from backend if user is logged in
      if (isAuthenticated) {
        try {
          const preferences = await activityApi.getActivityPreferences();
          if (preferences.preferredActivitySource) {
            dispatch({
              type: 'SET_SELECTED_APP',
              payload: preferences.preferredActivitySource as any,
            });
          }
        } catch (error) {
          console.log('No preferences found, using defaults');
        }
      }

      return apps;
    } catch (error) {
      console.error('Failed to detect health apps:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to detect health apps' });
      return [];
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [healthApps, isAuthenticated]);

  // ============================================================================
  // SELECT HEALTH APP
  // ============================================================================

  const selectHealthApp = useCallback(
    async (app: HealthAppType): Promise<void> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        // Connect to health app
        const success = await healthApps.connectApp(app);

        if (!success) {
          throw new Error('Failed to connect to health app');
        }

        // Save to storage
        await Promise.all([
          AsyncStorage.setItem('selectedHealthApp', app),
          AsyncStorage.setItem('healthAppConnected', 'true'),
        ]);

        dispatch({ type: 'SET_SELECTED_APP', payload: app });
        dispatch({ type: 'SET_CONNECTED', payload: true });

        // Save preferences to backend
        if (isAuthenticated) {
          await activityApi.updateActivityPreferences({
            preferredActivitySource: app as any,
            autoSyncEnabled: true,
            syncFrequency: 'realtime',
          });
        }

        // Sync today's data
        await syncActivityData();
      } catch (error) {
        console.error('Failed to select health app:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to connect to health app',
        });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [healthApps, isAuthenticated]
  );

  // ============================================================================
  // SYNC ACTIVITY DATA
  // ============================================================================

  const syncActivityData = useCallback(
    async (date?: string): Promise<void> => {
      if (!isAuthenticated || !state.selectedApp) {
        return;
      }

      try {
        dispatch({ type: 'CLEAR_ERROR' });

        // Get data from health app
        const activityData = await healthApps.getTodayActivityData();

        if (activityData) {
          dispatch({ type: 'SET_TODAY_ACTIVITY', payload: activityData });

          // Sync to backend
          await activityApi.syncActivityToBackend({
            source: activityData.source as any,
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
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to sync activity data',
        });
      }
    },
    [isAuthenticated, state.selectedApp, healthApps]
  );

  // ============================================================================
  // GET ACTIVITY SUMMARY
  // ============================================================================

  const getActivitySummary = useCallback(
    async (date?: string): Promise<ActivitySummary | null> => {
      if (!isAuthenticated) {
        return null;
      }

      try {
        dispatch({ type: 'CLEAR_ERROR' });
        return await activityApi.getActivitySummary(date);
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

  // ============================================================================
  // ADD MANUAL ACTIVITY
  // ============================================================================

  const addManualActivity = useCallback(
    async (activity: ManualActivityInput): Promise<void> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        await activityApi.addManualActivity(activity);

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

  // ============================================================================
  // DISCONNECT HEALTH APP
  // ============================================================================

  const disconnectHealthApp = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Clear storage
      await Promise.all([
        AsyncStorage.removeItem('selectedHealthApp'),
        AsyncStorage.removeItem('healthAppConnected'),
      ]);

      // Clear state
      dispatch({ type: 'SET_SELECTED_APP', payload: null });
      dispatch({ type: 'SET_CONNECTED', payload: false });
      dispatch({ type: 'SET_TODAY_ACTIVITY', payload: null });

      healthApps.setSelectedApp(null);
    } catch (error) {
      console.error('Failed to disconnect health app:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to disconnect health app',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [healthApps]);

  // ============================================================================
  // CLEAR ERROR
  // ============================================================================

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: ActivityContextType = {
    ...state,
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

// ============================================================================
// HOOK
// ============================================================================

export const useActivity = (): ActivityContextType => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within ActivityProvider');
  }
  return context;
};
