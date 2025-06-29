export enum ActivitySource {
  HEALTHKIT = 'healthkit',
  GOOGLEFIT = 'googlefit',
  SAMSUNG_HEALTH = 'samsung_health',
  HUAWEI_HEALTH = 'huawei_health',
  DEVICE_SENSORS = 'device_sensors',
  MANUAL = 'manual',
}

export interface HealthApp {
  source: ActivitySource;
  name: string;
  description: string;
  isInstalled: boolean;
  isConnected: boolean;
  packageName?: string;
  icon?: string;
}

export interface ActivityData {
  source: ActivitySource;
  caloriesBurned: number;
  steps?: number;
  distance?: number;
  duration?: number;
  activityType?: string;
  date?: string;
  externalId?: string;
}

export interface ActivitySummary {
  date: string;
  totalCaloriesBurned: number;
  totalSteps: number;
  totalDistance: number;
  activities: ActivityData[];
  lastSync: string | null;
  source: ActivitySource | null;
}
