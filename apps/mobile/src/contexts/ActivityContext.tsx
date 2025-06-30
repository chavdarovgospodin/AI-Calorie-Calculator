import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import {
  unifiedActivityService,
  ActivitySource,
} from '../services/activityService/activityService';
import {
  ActivitySummary,
  AvailableApp,
} from '@/services/activityService/interfaces';
import { Platform } from 'react-native';

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
  const [state, dispatch] = useReducer(activityReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Load saved settings on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadSavedSettings();
    }
  }, [isAuthenticated]);

  const loadSavedSettings = async () => {
    try {
      const [savedApp, isConnectedStr] = await Promise.all([
        AsyncStorage.getItem('selectedHealthApp'),
        AsyncStorage.getItem('healthAppConnected'),
      ]);

      if (savedApp && isConnectedStr === 'true') {
        dispatch({
          type: 'SET_SELECTED_APP',
          payload: savedApp as ActivitySource,
        });
        dispatch({ type: 'SET_CONNECTED', payload: true });

        // Sync today's data
        syncActivityData();
      }
    } catch (error) {
      console.error('Failed to load saved settings:', error);
    }
  };

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

  const getActivitySummary = useCallback(
    async (date?: string): Promise<ActivitySummary | null> => {
      if (!isAuthenticated) return null;

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
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

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

export const useActivity = (): ActivityContextType => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within ActivityProvider');
  }
  return context;
};
