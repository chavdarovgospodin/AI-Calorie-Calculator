import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { UserProfile } from './interfaces';
import { ActivityLevel } from './enums';

// ============================================================================
// TYPES (temporary - ще ги преместим в types/health.ts после)
// ============================================================================

export enum HealthAppType {
  APPLE_HEALTH = 'healthkit',
  GOOGLE_FIT = 'googlefit',
  SAMSUNG_HEALTH = 'samsung_health',
  HUAWEI_HEALTH = 'huawei_health',
  DEVICE_SENSORS = 'device_sensors',
  MANUAL = 'manual',
}

export interface HealthApp {
  source: HealthAppType;
  name: string;
  description: string;
  isAvailable?: boolean;
  isInstalled?: boolean;
  isConnected: boolean;
  packageName?: string;
  icon?: string;
}

export interface ActivityData {
  source: HealthAppType;
  date: string;
  caloriesBurned: number;
  steps?: number;
  distance?: number;
  duration?: number;
  activityType?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const HEALTH_APP_NAMES: Record<HealthAppType, string> = {
  [HealthAppType.APPLE_HEALTH]: 'Apple Health',
  [HealthAppType.GOOGLE_FIT]: 'Google Fit',
  [HealthAppType.SAMSUNG_HEALTH]: 'Samsung Health',
  [HealthAppType.HUAWEI_HEALTH]: 'Huawei Health',
  [HealthAppType.DEVICE_SENSORS]: 'Device Sensors',
  [HealthAppType.MANUAL]: 'Manual Entry',
};

const HEALTH_APP_ICONS: Record<HealthAppType, string> = {
  [HealthAppType.APPLE_HEALTH]: '🍎',
  [HealthAppType.GOOGLE_FIT]: '🏃‍♂️',
  [HealthAppType.SAMSUNG_HEALTH]: '💚',
  [HealthAppType.HUAWEI_HEALTH]: '❤️',
  [HealthAppType.DEVICE_SENSORS]: '📱',
  [HealthAppType.MANUAL]: '✍️',
};

const ANDROID_PACKAGE_NAMES: Partial<Record<HealthAppType, string>> = {
  [HealthAppType.GOOGLE_FIT]: 'com.google.android.apps.fitness',
  [HealthAppType.SAMSUNG_HEALTH]: 'com.sec.android.app.shealth',
  [HealthAppType.HUAWEI_HEALTH]: 'com.huawei.health',
};

// ============================================================================
// DEVICE DETECTION
// ============================================================================

/**
 * Check if running in Expo Go
 */
export const isExpoGo = (): boolean => {
  return Constants.appOwnership === 'expo';
};

/**
 * Check if app is installed on device (mock for now)
 */
export const checkAppInstalled = async (
  packageName: string
): Promise<boolean> => {
  try {
    // TODO: В реален проект използвай react-native-installed-apps
    // За сега връщаме mock данни
    return Math.random() > 0.5;
  } catch (error) {
    console.error(`Failed to check if ${packageName} is installed:`, error);
    return false;
  }
};

/**
 * Detect available health apps on device
 */
export const detectAvailableHealthApps = async (): Promise<HealthApp[]> => {
  const apps: HealthApp[] = [];

  // В Expo Go - само manual entry
  if (isExpoGo() || __DEV__) {
    console.log('🧪 Expo Go Mode: Only manual entry available');

    apps.push({
      source: HealthAppType.MANUAL,
      name: HEALTH_APP_NAMES[HealthAppType.MANUAL],
      description: 'Log activities manually',
      isAvailable: true,
      isInstalled: true,
      isConnected: false,
      icon: HEALTH_APP_ICONS[HealthAppType.MANUAL],
    });

    return apps;
  }

  // Real detection за production build (EAS)
  if (Platform.OS === 'ios') {
    // Apple Health (HealthKit)
    apps.push({
      source: HealthAppType.APPLE_HEALTH,
      name: HEALTH_APP_NAMES[HealthAppType.APPLE_HEALTH],
      description: 'Integrates with all iOS health apps',
      isAvailable: true,
      isInstalled: true,
      isConnected: false,
      icon: HEALTH_APP_ICONS[HealthAppType.APPLE_HEALTH],
    });
  } else if (Platform.OS === 'android') {
    const brand = Device.brand?.toLowerCase() || '';

    // Google Fit
    apps.push({
      source: HealthAppType.GOOGLE_FIT,
      name: HEALTH_APP_NAMES[HealthAppType.GOOGLE_FIT],
      description: 'Integrates with most Android fitness apps',
      isAvailable: true,
      isInstalled: await checkAppInstalled(
        ANDROID_PACKAGE_NAMES[HealthAppType.GOOGLE_FIT]!
      ),
      isConnected: false,
      packageName: ANDROID_PACKAGE_NAMES[HealthAppType.GOOGLE_FIT],
      icon: HEALTH_APP_ICONS[HealthAppType.GOOGLE_FIT],
    });

    // Samsung Health
    if (brand === 'samsung') {
      apps.push({
        source: HealthAppType.SAMSUNG_HEALTH,
        name: HEALTH_APP_NAMES[HealthAppType.SAMSUNG_HEALTH],
        description: 'Direct Samsung Health integration',
        isAvailable: true,
        isInstalled: await checkAppInstalled(
          ANDROID_PACKAGE_NAMES[HealthAppType.SAMSUNG_HEALTH]!
        ),
        isConnected: false,
        packageName: ANDROID_PACKAGE_NAMES[HealthAppType.SAMSUNG_HEALTH],
        icon: HEALTH_APP_ICONS[HealthAppType.SAMSUNG_HEALTH],
      });
    }

    // Huawei Health
    if (brand === 'huawei' || brand === 'honor') {
      apps.push({
        source: HealthAppType.HUAWEI_HEALTH,
        name: HEALTH_APP_NAMES[HealthAppType.HUAWEI_HEALTH],
        description: 'Direct Huawei Health integration',
        isAvailable: true,
        isInstalled: await checkAppInstalled(
          ANDROID_PACKAGE_NAMES[HealthAppType.HUAWEI_HEALTH]!
        ),
        isConnected: false,
        packageName: ANDROID_PACKAGE_NAMES[HealthAppType.HUAWEI_HEALTH],
        icon: HEALTH_APP_ICONS[HealthAppType.HUAWEI_HEALTH],
      });
    }
  }

  // Device sensors - always available
  apps.push({
    source: HealthAppType.DEVICE_SENSORS,
    name: HEALTH_APP_NAMES[HealthAppType.DEVICE_SENSORS],
    description: 'Built-in step counter and sensors',
    isAvailable: true,
    isInstalled: true,
    isConnected: false,
    icon: HEALTH_APP_ICONS[HealthAppType.DEVICE_SENSORS],
  });

  // Manual entry - always available
  apps.push({
    source: HealthAppType.MANUAL,
    name: HEALTH_APP_NAMES[HealthAppType.MANUAL],
    description: 'Manually log your activities',
    isAvailable: true,
    isInstalled: true,
    isConnected: false,
    icon: HEALTH_APP_ICONS[HealthAppType.MANUAL],
  });

  console.log('📱 Detected health apps:', apps.length);
  return apps;
};

// ============================================================================
// PERMISSIONS
// ============================================================================

/**
 * Request permissions for health app
 */
export const requestHealthAppPermissions = async (
  appType: HealthAppType
): Promise<boolean> => {
  // В Expo Go - no real permissions
  if (isExpoGo()) {
    return appType === HealthAppType.MANUAL;
  }

  // Real permission requests в production build
  try {
    switch (appType) {
      case HealthAppType.MANUAL:
        return true; // No permissions needed

      case HealthAppType.APPLE_HEALTH:
        // TODO: Implement Apple Health permissions
        console.log('Apple Health permissions - requires EAS build');
        return false;

      case HealthAppType.GOOGLE_FIT:
        // TODO: Implement Google Fit permissions
        console.log('Google Fit permissions - requires EAS build');
        return false;

      case HealthAppType.SAMSUNG_HEALTH:
        // TODO: Implement Samsung Health permissions
        console.log('Samsung Health permissions - requires EAS build');
        return false;

      case HealthAppType.HUAWEI_HEALTH:
        // TODO: Implement Huawei Health permissions
        console.log('Huawei Health permissions - requires EAS build');
        return false;

      case HealthAppType.DEVICE_SENSORS:
        // TODO: Implement device sensors permissions
        console.log('Device sensors permissions - requires EAS build');
        return false;

      default:
        return false;
    }
  } catch (error) {
    console.error('Permission request failed:', error);
    return false;
  }
};

// ============================================================================
// CONNECTION
// ============================================================================

/**
 * Connect to health app
 */
export const connectToHealthApp = async (
  appType: HealthAppType
): Promise<boolean> => {
  // Handle Expo Go limitations
  if (isExpoGo() && appType !== HealthAppType.MANUAL) {
    console.warn(
      '⚠️ Health APIs not available in Expo Go. Use Manual Entry or create a development build.'
    );
    return false;
  }

  // Manual entry always works
  if (appType === HealthAppType.MANUAL) {
    return true;
  }

  // Request permissions first
  const hasPermission = await requestHealthAppPermissions(appType);
  if (!hasPermission) {
    return false;
  }

  // Real health app connections require EAS build
  try {
    switch (appType) {
      case HealthAppType.APPLE_HEALTH:
        // TODO: Initialize Apple Health
        console.log('Apple Health initialization - requires EAS build');
        return true;

      case HealthAppType.GOOGLE_FIT:
        // TODO: Initialize Google Fit
        console.log('Google Fit initialization - requires EAS build');
        return true;

      case HealthAppType.SAMSUNG_HEALTH:
        // TODO: Initialize Samsung Health
        console.log('Samsung Health initialization - requires EAS build');
        return true;

      case HealthAppType.HUAWEI_HEALTH:
        // TODO: Initialize Huawei Health
        console.log('Huawei Health initialization - requires EAS build');
        return true;

      case HealthAppType.DEVICE_SENSORS:
        // TODO: Initialize Device Sensors
        console.log('Device Sensors initialization - requires EAS build');
        return true;

      default:
        return false;
    }
  } catch (error) {
    console.error('App connection failed:', error);
    return false;
  }
};

// ============================================================================
// DATA RETRIEVAL
// ============================================================================

/**
 * Get today's activity data from health app
 */
export const getTodayActivityData = async (
  appType: HealthAppType
): Promise<ActivityData | null> => {
  if (!appType) {
    return null;
  }

  const today = new Date().toISOString().split('T')[0];

  // Manual entry doesn't provide automatic data
  if (appType === HealthAppType.MANUAL) {
    return null;
  }

  // Mock data for development
  if (isExpoGo()) {
    return {
      source: appType,
      date: today,
      caloriesBurned: 0,
      steps: 0,
      distance: 0,
    };
  }

  // Real data retrieval (EAS build only)
  try {
    switch (appType) {
      case HealthAppType.APPLE_HEALTH:
        // TODO: Get Apple Health data
        return {
          source: appType,
          date: today,
          caloriesBurned: 0,
          steps: 0,
          distance: 0,
        };

      case HealthAppType.GOOGLE_FIT:
        // TODO: Get Google Fit data
        return {
          source: appType,
          date: today,
          caloriesBurned: 0,
          steps: 0,
          distance: 0,
        };

      case HealthAppType.SAMSUNG_HEALTH:
        // TODO: Get Samsung Health data
        return {
          source: appType,
          date: today,
          caloriesBurned: 0,
          steps: 0,
          distance: 0,
        };

      case HealthAppType.HUAWEI_HEALTH:
        // TODO: Get Huawei Health data
        return {
          source: appType,
          date: today,
          caloriesBurned: 0,
          steps: 0,
          distance: 0,
        };

      case HealthAppType.DEVICE_SENSORS:
        // TODO: Get Device Sensors data
        return {
          source: appType,
          date: today,
          caloriesBurned: 0,
          steps: 0,
          distance: 0,
        };

      default:
        return null;
    }
  } catch (error) {
    console.error('Failed to get activity data:', error);
    return null;
  }
};

// ============================================================================
// UTILITY
// ============================================================================

/**
 * Calculate calories from manual activity
 */

/**
 * Calculate personalized calories burned based on activity and user profile
 */
export const calculateActivityCalories = (
  activity: {
    activityType: string;
    duration: number;
    intensity: 'low' | 'moderate' | 'high';
  },
  user: UserProfile
): number => {
  // Базови калории per минута за различни дейности (за 70кг човек)
  const calorieRates: Record<string, Record<string, number>> = {
    walking: { low: 3, moderate: 4, high: 5 },
    running: { low: 8, moderate: 10, high: 12 },
    cycling: { low: 5, moderate: 7, high: 9 },
    swimming: { low: 6, moderate: 8, high: 11 },
    gym: { low: 4, moderate: 6, high: 8 },
    yoga: { low: 2, moderate: 3, high: 4 },
    dancing: { low: 3, moderate: 5, high: 7 },
    sports: { low: 4, moderate: 6, high: 8 },
    other: { low: 3, moderate: 4, high: 5 },
  };

  const activityType = activity.activityType.toLowerCase();
  const rates = calorieRates[activityType] || calorieRates.other;
  const baseRate = rates[activity.intensity];

  const weightFactor = user.weight / 70;

  // По-безопасен подход със switch
  let activityMultiplier: number;
  switch (user.activity_level) {
    case ActivityLevel.SEDENTARY:
      activityMultiplier = 0.9;
      break;
    case ActivityLevel.LIGHTLY_ACTIVE:
      activityMultiplier = 1.0;
      break;
    case ActivityLevel.MODERATELY_ACTIVE:
      activityMultiplier = 1.1;
      break;
    case ActivityLevel.VERY_ACTIVE:
      activityMultiplier = 1.2;
      break;
    case ActivityLevel.EXTREMELY_ACTIVE:
      activityMultiplier = 1.3;
      break;
    default:
      activityMultiplier = 1.0; // fallback за неизвестни стойности
  }

  const genderFactor = user.gender === 'male' ? 1.05 : 1.0;

  const ageFactor =
    user.age < 30 ? 1.05 : user.age < 40 ? 1.0 : user.age < 50 ? 0.95 : 0.9;

  const caloriesPerMinute =
    baseRate * weightFactor * activityMultiplier * genderFactor * ageFactor;

  return Math.round(caloriesPerMinute * activity.duration);
};
