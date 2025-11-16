// apps/mobile/src/contexts/ActivityContext.tsx - ПОЧИСТЕН
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from './AuthContext';
import { useHealthApps } from '@/hooks/useHealthApps';
import * as deviceHealth from '@/services/deviceHealth';

import type {
  HealthAppType,
  HealthApp,
  ActivityData,
} from '@/services/deviceHealth';

// ============================================================================
// TYPES & INTERFACES - ПОЧИСТЕНИ
// ============================================================================

interface ActivityState {
  availableApps: HealthApp[];
  selectedApp: HealthAppType | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

type ActivityAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AVAILABLE_APPS'; payload: HealthApp[] }
  | { type: 'SET_SELECTED_APP'; payload: HealthAppType | null }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

interface ActivityContextType extends ActivityState {
  detectHealthApps: () => Promise<HealthApp[]>;
  selectHealthApp: (app: HealthAppType) => Promise<void>;
  disconnectHealthApp: () => Promise<void>;
  clearError: () => void;
}

// ============================================================================
// REDUCER - ПОЧИСТЕН
// ============================================================================

const initialState: ActivityState = {
  availableApps: [],
  selectedApp: null,
  isConnected: false,
  isLoading: false,
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
  const healthApps = useHealthApps();

  // Initialize on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadSavedPreferences();
    }
  }, [isAuthenticated]);

  const loadSavedPreferences = async () => {
    try {
      const savedApp = await AsyncStorage.getItem('selectedHealthApp');
      if (savedApp) {
        dispatch({
          type: 'SET_SELECTED_APP',
          payload: savedApp as HealthAppType,
        });
        dispatch({ type: 'SET_CONNECTED', payload: true });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const detectHealthApps = useCallback(async (): Promise<HealthApp[]> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const apps = await healthApps.detectAvailableApps();
      dispatch({ type: 'SET_AVAILABLE_APPS', payload: apps });
      return apps;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to detect health apps' });
      return [];
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [healthApps]);

  const selectHealthApp = useCallback(
    async (app: HealthAppType) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        // Request permissions if needed
        if (app !== 'manual') {
          const hasPermissions = await healthApps.requestPermissions(app);
          if (!hasPermissions) {
            throw new Error('Permissions denied');
          }
        }

        // Save selection
        await AsyncStorage.setItem('selectedHealthApp', app);
        dispatch({ type: 'SET_SELECTED_APP', payload: app });
        dispatch({ type: 'SET_CONNECTED', payload: true });
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to connect health app',
        });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [healthApps]
  );

  const disconnectHealthApp = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('selectedHealthApp');
      dispatch({ type: 'SET_SELECTED_APP', payload: null });
      dispatch({ type: 'SET_CONNECTED', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to disconnect' });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: ActivityContextType = {
    ...state,
    detectHealthApps,
    selectHealthApp,
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
