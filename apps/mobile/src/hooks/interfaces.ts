// ============================================================================
// SHARED ENUMS
// ============================================================================

/**
 * Unified health app / activity source type
 * Използва се и за health apps и за activity tracking
 */
export enum HealthAppType {
  APPLE_HEALTH = 'healthkit',
  GOOGLE_FIT = 'googlefit',
  SAMSUNG_HEALTH = 'samsung_health',
  HUAWEI_HEALTH = 'huawei_health',
  DEVICE_SENSORS = 'device_sensors',
  MANUAL = 'manual',
}

// Alias за backward compatibility
export const ActivitySource = HealthAppType;
export type ActivitySource = HealthAppType;

// ============================================================================
// HEALTH APP INTERFACES
// ============================================================================

/**
 * Unified health app configuration
 * Represents a health/fitness app available on the device
 */
export interface HealthApp {
  // Core identification
  source: HealthAppType;
  name: string;
  description: string;

  // Availability & connection status
  isAvailable?: boolean;
  isInstalled?: boolean; // Optional: для Android app detection
  isConnected: boolean;

  // Optional metadata
  packageName?: string; // Android package name
  icon?: string; // Icon emoji or identifier
}

// ============================================================================
// ACTIVITY DATA INTERFACES
// ============================================================================

/**
 * Activity data from health apps or manual entry
 */
export interface ActivityData {
  // Source identification
  source: HealthAppType;
  date: string;

  // Core metrics
  caloriesBurned: number;
  steps?: number;
  distance?: number; // in kilometers
  duration?: number; // in minutes

  // Optional metadata
  activityType?: string; // e.g., 'walking', 'running', 'cycling'
  externalId?: string; // ID from external health app
  notes?: string; // Manual entry notes
}

/**
 * Daily activity summary aggregating data from multiple sources
 */
export interface ActivitySummary {
  date: string;

  // Aggregated metrics
  totalCaloriesBurned: number;
  totalSteps: number;
  totalDistance: number; // in kilometers

  // Individual activities
  activities: ActivityData[];

  // Metadata
  lastSync: string | null; // ISO timestamp
  source: HealthAppType | null; // Primary source
}

// ============================================================================
// ACTIVITY PREFERENCES
// ============================================================================

export interface ActivityPreferences {
  preferredActivitySource?: HealthAppType;
  enabledSources?: HealthAppType[];
  autoSyncEnabled?: boolean;
  syncFrequency?: 'realtime' | 'hourly' | 'daily';
  activityGoal?: number; // Daily calorie burn goal
}

// ============================================================================
// MANUAL ACTIVITY INPUT
// ============================================================================

export interface ManualActivityInput {
  activityType: string;
  duration: number; // in minutes
  intensity: 'low' | 'moderate' | 'high';
  caloriesBurned?: number; // Optional override
  notes?: string;
  date?: string; // Optional, defaults to today
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const isHealthKitSource = (source: HealthAppType): boolean => {
  return source === HealthAppType.APPLE_HEALTH;
};

export const isGoogleFitSource = (source: HealthAppType): boolean => {
  return source === HealthAppType.GOOGLE_FIT;
};

export const isManualSource = (source: HealthAppType): boolean => {
  return source === HealthAppType.MANUAL;
};

export const requiresNativeModule = (source: HealthAppType): boolean => {
  return source !== HealthAppType.MANUAL;
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const HEALTH_APP_NAMES: Record<HealthAppType, string> = {
  [HealthAppType.APPLE_HEALTH]: 'Apple Health',
  [HealthAppType.GOOGLE_FIT]: 'Google Fit',
  [HealthAppType.SAMSUNG_HEALTH]: 'Samsung Health',
  [HealthAppType.HUAWEI_HEALTH]: 'Huawei Health',
  [HealthAppType.DEVICE_SENSORS]: 'Device Sensors',
  [HealthAppType.MANUAL]: 'Manual Entry',
};

export const HEALTH_APP_ICONS: Record<HealthAppType, string> = {
  [HealthAppType.APPLE_HEALTH]: '🍎',
  [HealthAppType.GOOGLE_FIT]: '🏃‍♂️',
  [HealthAppType.SAMSUNG_HEALTH]: '💚',
  [HealthAppType.HUAWEI_HEALTH]: '❤️',
  [HealthAppType.DEVICE_SENSORS]: '📱',
  [HealthAppType.MANUAL]: '✍️',
};

export const ANDROID_PACKAGE_NAMES: Partial<Record<HealthAppType, string>> = {
  [HealthAppType.GOOGLE_FIT]: 'com.google.android.apps.fitness',
  [HealthAppType.SAMSUNG_HEALTH]: 'com.sec.android.app.shealth',
  [HealthAppType.HUAWEI_HEALTH]: 'com.huawei.health',
};
