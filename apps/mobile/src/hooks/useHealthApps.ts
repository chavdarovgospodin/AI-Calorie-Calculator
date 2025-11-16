import { useState, useCallback } from 'react';

// Import device health service
import * as deviceHealth from '@/services/deviceHealth';

// Import types from service
import type {
  HealthAppType,
  HealthApp,
  ActivityData,
} from '@/services/deviceHealth';

export const useHealthApps = () => {
  const [availableApps, setAvailableApps] = useState<HealthApp[]>([]);
  const [selectedApp, setSelectedApp] = useState<HealthAppType | null>(null);

  // ============================================================================
  // DETECTION (uses deviceHealth service)
  // ============================================================================

  const detectAvailableApps = useCallback(async (): Promise<HealthApp[]> => {
    try {
      const apps = await deviceHealth.detectAvailableHealthApps();
      setAvailableApps(apps);
      return apps;
    } catch (error) {
      console.error('Failed to detect health apps:', error);
      return [];
    }
  }, []);

  // ============================================================================
  // PERMISSIONS (uses deviceHealth service)
  // ============================================================================

  const requestPermissions = useCallback(
    async (appType: HealthAppType): Promise<boolean> => {
      try {
        return await deviceHealth.requestHealthAppPermissions(appType);
      } catch (error) {
        console.error('Permission request failed:', error);
        return false;
      }
    },
    []
  );

  // ============================================================================
  // CONNECTION (uses deviceHealth service)
  // ============================================================================

  const connectApp = useCallback(
    async (appType: HealthAppType): Promise<boolean> => {
      try {
        const success = await deviceHealth.connectToHealthApp(appType);

        if (success) {
          setSelectedApp(appType);
        }

        return success;
      } catch (error) {
        console.error('App connection failed:', error);
        return false;
      }
    },
    []
  );

  // ============================================================================
  // DATA RETRIEVAL (uses deviceHealth service)
  // ============================================================================

  const getTodayActivityData =
    useCallback(async (): Promise<ActivityData | null> => {
      if (!selectedApp) {
        return null;
      }

      try {
        return await deviceHealth.getTodayActivityData(selectedApp);
      } catch (error) {
        console.error('Failed to get activity data:', error);
        return null;
      }
    }, [selectedApp]);

  // ============================================================================
  // UTILITIES
  // ============================================================================

  const getAvailableApps = useCallback((): HealthApp[] => {
    return availableApps;
  }, [availableApps]);

  const getSelectedApp = useCallback((): HealthAppType | null => {
    return selectedApp;
  }, [selectedApp]);

  const memoizedSetSelectedApp = useCallback(
    (appType: HealthAppType | null) => {
      setSelectedApp(appType);
    },
    []
  );

  const isExpoGo = useCallback((): boolean => {
    return deviceHealth.isExpoGo();
  }, []);

  // ============================================================================
  // RETURN ALL METHODS
  // ============================================================================

  return {
    // State
    availableApps,
    selectedApp,

    // Setters
    setSelectedApp: memoizedSetSelectedApp,

    // Detection & Connection (deviceHealth service)
    detectAvailableApps,
    requestPermissions,
    connectApp,

    // Data Retrieval (deviceHealth service)
    getTodayActivityData,

    // Utilities
    getAvailableApps,
    getSelectedApp,
    isExpoGo,
  };
};
