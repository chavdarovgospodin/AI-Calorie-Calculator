export enum HealthAppType {
  APPLE_HEALTH = 'healthkit',
  GOOGLE_FIT = 'googlefit',
  SAMSUNG_HEALTH = 'samsung_health',
  HUAWEI_HEALTH = 'huawei_health',
  DEVICE_SENSORS = 'device_sensors',
  MANUAL = 'manual',
}

export interface HealthApp {
  type: HealthAppType;
  name: string;
  description: string;
  isAvailable: boolean;
  isConnected: boolean;
}

export interface ActivityData {
  date: string;
  caloriesBurned: number;
  steps?: number;
  distance?: number;
  duration?: number;
  activityType?: string;
  source: HealthAppType;
}
