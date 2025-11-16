// apps/mobile/src/services/deviceHealth.ts - ПОЧИСТЕН
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { HealthApp, HealthAppType, ActivityData } from '@/types/health';
import { User } from '@/types/user';
import { ActivityLevel } from './enums';

// Константи
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

// Detect available health apps
export const detectAvailableHealthApps = async (): Promise<HealthApp[]> => {
  const apps: HealthApp[] = [];

  if (Platform.OS === 'ios') {
    apps.push({
      source: HealthAppType.APPLE_HEALTH,
      name: HEALTH_APP_NAMES[HealthAppType.APPLE_HEALTH],
      description: 'Sync with Apple Health data',
      isAvailable: true,
      isConnected: false,
      icon: HEALTH_APP_ICONS[HealthAppType.APPLE_HEALTH],
    });
  } else if (Platform.OS === 'android') {
    // Android apps
    apps.push({
      source: HealthAppType.GOOGLE_FIT,
      name: HEALTH_APP_NAMES[HealthAppType.GOOGLE_FIT],
      description: 'Sync with Google Fit',
      isAvailable: true, // TODO: Check if installed
      isConnected: false,
      icon: HEALTH_APP_ICONS[HealthAppType.GOOGLE_FIT],
    });
  }

  // Always add manual option
  apps.push({
    source: HealthAppType.MANUAL,
    name: HEALTH_APP_NAMES[HealthAppType.MANUAL],
    description: 'Manually log your activities',
    isAvailable: true,
    isConnected: false,
    icon: HEALTH_APP_ICONS[HealthAppType.MANUAL],
  });

  return apps;
};

// Request permissions
export const requestPermissions = async (
  appType: HealthAppType
): Promise<boolean> => {
  if (appType === HealthAppType.MANUAL) {
    return true;
  }

  // TODO: Implement actual permission requests
  console.log('Requesting permissions for:', appType);
  return true; // Mock for now
};

// Calculate calories
export const calculateActivityCalories = (
  activity: {
    activityType: string;
    duration: number;
    intensity: 'low' | 'moderate' | 'high';
  },
  user: User
): number => {
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

  const activityMultipliers: Record<ActivityLevel, number> = {
    [ActivityLevel.SEDENTARY]: 0.9,
    [ActivityLevel.LIGHTLY_ACTIVE]: 1.0,
    [ActivityLevel.MODERATELY_ACTIVE]: 1.1,
    [ActivityLevel.VERY_ACTIVE]: 1.2,
    [ActivityLevel.EXTREMELY_ACTIVE]: 1.3,
  };

  const activityMultiplier = activityMultipliers[user.activity_level] || 1.0;
  const genderFactor = user.gender === 'male' ? 1.05 : 1.0;
  const ageFactor =
    user.age < 30 ? 1.05 : user.age < 40 ? 1.0 : user.age < 50 ? 0.95 : 0.9;

  const caloriesPerMinute =
    baseRate * weightFactor * activityMultiplier * genderFactor * ageFactor;

  return Math.round(caloriesPerMinute * activity.duration);
};

export const isExpoGo = (): boolean => {
  return Constants.appOwnership === 'expo';
};
