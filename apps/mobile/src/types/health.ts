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
  isAvailable: boolean;
  isConnected: boolean;
  icon?: string;
  packageName?: string;
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

export interface ActivitySummary {
  date: string;
  totalCaloriesBurned: number;
  totalSteps: number;
  totalDistance: number;
  activities: ActivityData[];
  lastSync: string | null;
  source: HealthAppType | null;
}

export interface ManualActivityInput {
  activityType: string;
  duration: number;
  intensity: 'low' | 'moderate' | 'high';
  caloriesBurned?: number;
  notes?: string;
  date?: string;
}
