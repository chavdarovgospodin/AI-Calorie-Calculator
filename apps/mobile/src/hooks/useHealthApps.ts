import { useState, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { HealthAppType, HealthApp, ActivityData } from './interfaces';

export const useHealthApps = () => {
  const [availableApps, setAvailableApps] = useState<HealthApp[]>([]);
  const [selectedApp, setSelectedApp] = useState<HealthAppType | null>(null);

  const isExpoGo = useMemo(() => Constants.appOwnership === 'expo', []);

  const detectAvailableApps = useCallback(async (): Promise<HealthApp[]> => {
    const apps: HealthApp[] = [];

    // В Expo Go - само manual entry
    if (isExpoGo || __DEV__) {
      console.log('🧪 Expo Go Mode: Only manual entry available');

      const expoGoApps = [
        {
          source: HealthAppType.MANUAL,
          name: 'Manual Entry',
          description: 'Log activities manually',
          isAvailable: true,
          isConnected: false,
        },
      ];

      setAvailableApps(expoGoApps);
      return expoGoApps;
    }

    // Real detection за production build (EAS)
    return detectRealHealthApps();
  }, [isExpoGo]);

  const detectRealHealthApps = useCallback(async (): Promise<HealthApp[]> => {
    const apps: HealthApp[] = [];

    // iOS apps
    if (Platform.OS === 'ios') {
      apps.push({
        source: HealthAppType.APPLE_HEALTH,
        name: 'Apple Health',
        description: 'Integrates with all iOS health apps',
        isAvailable: true,
        isConnected: false,
      });
    } else {
      // Android apps - use expo-device
      const brand = Device.brand || '';

      // Google Fit
      apps.push({
        source: HealthAppType.GOOGLE_FIT,
        name: 'Google Fit',
        description: 'Integrates with most Android fitness apps',
        isAvailable: true,
        isConnected: false,
      });

      // Samsung Health
      if (brand.toLowerCase() === 'samsung') {
        apps.push({
          source: HealthAppType.SAMSUNG_HEALTH,
          name: 'Samsung Health',
          description: 'Direct Samsung Health integration',
          isAvailable: true,
          isConnected: false,
        });
      }

      // Huawei Health
      if (brand.toLowerCase() === 'huawei' || brand.toLowerCase() === 'honor') {
        apps.push({
          source: HealthAppType.HUAWEI_HEALTH,
          name: 'Huawei Health',
          description: 'Direct Huawei Health integration',
          isAvailable: true,
          isConnected: false,
        });
      }
    }

    // Device sensors - always available
    apps.push({
      source: HealthAppType.DEVICE_SENSORS,
      name: 'Device Sensors',
      description: 'Built-in step counter and sensors',
      isAvailable: true,
      isConnected: false,
    });

    // Manual entry - always available
    apps.push({
      source: HealthAppType.MANUAL,
      name: 'Manual Entry',
      description: 'Manually log your activities',
      isAvailable: true,
      isConnected: false,
    });

    setAvailableApps(apps);
    return apps;
  }, []);

  const requestPermissions = useCallback(
    async (appType: HealthAppType): Promise<boolean> => {
      // В Expo Go - no real permissions
      if (isExpoGo) {
        return appType === HealthAppType.MANUAL;
      }

      // Real permission requests в production build
      try {
        switch (appType) {
          case HealthAppType.MANUAL:
            return true; // No permissions needed
          default:
            // За production ще използваме expo-permissions или native modules
            console.log(
              `Permission request for ${appType} - requires EAS build`
            );
            return false;
        }
      } catch (error) {
        console.error('Permission request failed:', error);
        return false;
      }
    },
    [isExpoGo]
  );

  const initializeAppleHealth = useCallback(async (): Promise<boolean> => {
    if (isExpoGo) return false;

    try {
      // Requires react-native-health in EAS build
      const AppleHealthKit = require('react-native-health').default;
      // Initialize logic here
      return true;
    } catch (error) {
      console.error('Apple Health not available:', error);
      return false;
    }
  }, [isExpoGo]);

  const initializeGoogleFit = useCallback(async (): Promise<boolean> => {
    if (isExpoGo) return false;

    try {
      // Requires react-native-google-fit in EAS build
      const GoogleFit = require('react-native-google-fit').default;
      // Initialize logic here
      return true;
    } catch (error) {
      console.error('Google Fit not available:', error);
      return false;
    }
  }, [isExpoGo]);

  const initializeSamsungHealth = useCallback(async (): Promise<boolean> => {
    if (isExpoGo) return false;
    console.log('Samsung Health initialization - requires EAS build');
    return false;
  }, [isExpoGo]);

  const initializeHuaweiHealth = useCallback(async (): Promise<boolean> => {
    if (isExpoGo) return false;
    console.log('Huawei Health initialization - requires EAS build');
    return false;
  }, [isExpoGo]);

  const initializeDeviceSensors = useCallback(async (): Promise<boolean> => {
    if (isExpoGo) return false;
    console.log('Device Sensors initialization - requires EAS build');
    return false;
  }, [isExpoGo]);

  const getHealthKitData = useCallback(
    async (date: string): Promise<ActivityData> => {
      // Placeholder - requires EAS build
      return {
        date,
        caloriesBurned: 0,
        steps: 0,
        distance: 0,
        source: HealthAppType.APPLE_HEALTH,
      };
    },
    []
  );

  const getGoogleFitData = useCallback(
    async (date: string): Promise<ActivityData> => {
      // Placeholder - requires EAS build
      return {
        date,
        caloriesBurned: 0,
        steps: 0,
        distance: 0,
        source: HealthAppType.GOOGLE_FIT,
      };
    },
    []
  );

  const getSamsungHealthData = useCallback(
    async (date: string): Promise<ActivityData> => {
      return {
        date,
        caloriesBurned: 0,
        steps: 0,
        distance: 0,
        source: HealthAppType.SAMSUNG_HEALTH,
      };
    },
    []
  );

  const getHuaweiHealthData = useCallback(
    async (date: string): Promise<ActivityData> => {
      return {
        date,
        caloriesBurned: 0,
        steps: 0,
        distance: 0,
        source: HealthAppType.HUAWEI_HEALTH,
      };
    },
    []
  );

  const getDeviceSensorData = useCallback(
    async (date: string): Promise<ActivityData> => {
      return {
        date,
        caloriesBurned: 0,
        steps: 0,
        distance: 0,
        source: HealthAppType.DEVICE_SENSORS,
      };
    },
    []
  );

  const connectApp = useCallback(
    async (appType: HealthAppType): Promise<boolean> => {
      // Handle Expo Go limitations
      if (isExpoGo && appType !== HealthAppType.MANUAL) {
        console.warn(
          '⚠️ Health APIs not available in Expo Go. Use Manual Entry or create a development build.'
        );
        return false;
      }

      // Manual entry always works
      if (appType === HealthAppType.MANUAL) {
        setSelectedApp(appType);
        return true;
      }

      // Real health app connections require EAS build
      const hasPermission = await requestPermissions(appType);
      if (!hasPermission) {
        return false;
      }

      try {
        // These will only work in EAS production build
        switch (appType) {
          case HealthAppType.APPLE_HEALTH:
            return await initializeAppleHealth();
          case HealthAppType.GOOGLE_FIT:
            return await initializeGoogleFit();
          case HealthAppType.SAMSUNG_HEALTH:
            return await initializeSamsungHealth();
          case HealthAppType.HUAWEI_HEALTH:
            return await initializeHuaweiHealth();
          case HealthAppType.DEVICE_SENSORS:
            return await initializeDeviceSensors();
          default:
            return false;
        }
      } catch (error) {
        console.error('App connection failed:', error);
        return false;
      }
    },
    [
      isExpoGo,
      requestPermissions,
      initializeAppleHealth,
      initializeGoogleFit,
      initializeSamsungHealth,
      initializeHuaweiHealth,
      initializeDeviceSensors,
    ]
  );

  const getTodayActivityData =
    useCallback(async (): Promise<ActivityData | null> => {
      if (!selectedApp) {
        return null;
      }

      const today = new Date().toISOString().split('T')[0];

      // Manual entry doesn't provide automatic data
      if (selectedApp === HealthAppType.MANUAL) {
        return null;
      }

      // Mock data for development
      if (isExpoGo) {
        return {
          date: today,
          caloriesBurned: 0,
          steps: 0,
          distance: 0,
          source: selectedApp,
        };
      }

      // Real data retrieval (EAS build only)
      try {
        switch (selectedApp) {
          case HealthAppType.APPLE_HEALTH:
            return await getHealthKitData(today);
          case HealthAppType.GOOGLE_FIT:
            return await getGoogleFitData(today);
          case HealthAppType.SAMSUNG_HEALTH:
            return await getSamsungHealthData(today);
          case HealthAppType.HUAWEI_HEALTH:
            return await getHuaweiHealthData(today);
          case HealthAppType.DEVICE_SENSORS:
            return await getDeviceSensorData(today);
          default:
            return null;
        }
      } catch (error) {
        console.error('Failed to get activity data:', error);
        return null;
      }
    }, [
      selectedApp,
      isExpoGo,
      getHealthKitData,
      getGoogleFitData,
      getSamsungHealthData,
      getHuaweiHealthData,
      getDeviceSensorData,
    ]);

  // Memoize setSelectedApp to prevent unnecessary re-renders
  const memoizedSetSelectedApp = useCallback(
    (appType: HealthAppType | null) => {
      setSelectedApp(appType);
    },
    []
  );

  const getAvailableApps = useCallback((): HealthApp[] => {
    return availableApps;
  }, [availableApps]);

  return {
    availableApps,
    selectedApp,
    setSelectedApp: memoizedSetSelectedApp,
    detectAvailableApps,
    connectApp,
    getTodayActivityData,
    requestPermissions,
    getAvailableApps,
  };
};
