import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  Min,
  Max,
} from 'class-validator';

export enum ActivitySource {
  HEALTHKIT = 'healthkit',
  GOOGLEFIT = 'googlefit',
  SAMSUNG_HEALTH = 'samsung_health',
  HUAWEI_HEALTH = 'huawei_health',
  FITBIT = 'fitbit',
  GARMIN = 'garmin',
  STRAVA = 'strava',
  MANUAL = 'manual',
  DEVICE_SENSORS = 'device_sensors',
}

export enum SyncFrequency {
  REALTIME = 'realtime',
  HOURLY = 'hourly',
  DAILY = 'daily',
}

export class ActivitySyncDto {
  @IsEnum(ActivitySource)
  source: ActivitySource;

  @IsNumber()
  @Min(0)
  @Max(10000)
  caloriesBurned: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  steps?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  distance?: number; // in km

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number; // in minutes

  @IsOptional()
  @IsString()
  externalId?: string; // ID from external source

  @IsOptional()
  @IsString()
  activityType?: string; // walking, running, cycling, etc.

  @IsOptional()
  @IsString()
  date?: string; // YYYY-MM-DD format
}

export class UserActivityPreferencesDto {
  @IsOptional()
  @IsEnum(ActivitySource)
  preferredActivitySource?: ActivitySource;

  @IsOptional()
  @IsArray()
  @IsEnum(ActivitySource, { each: true })
  enabledSources?: ActivitySource[];

  @IsOptional()
  @IsBoolean()
  autoSyncEnabled?: boolean;

  @IsOptional()
  @IsEnum(SyncFrequency)
  syncFrequency?: SyncFrequency;

  @IsOptional()
  @IsString()
  calorieCalculationMethod?: 'direct' | 'estimated' | 'manual';

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(2000)
  activityGoal?: number;
}

export class ManualActivityEntryDto {
  @IsString()
  activityType: string;

  @IsNumber()
  @Min(1)
  @Max(600)
  duration: number; // minutes

  @IsEnum(['low', 'moderate', 'high'])
  intensity: 'low' | 'moderate' | 'high';

  @IsOptional()
  @IsNumber()
  @Min(0)
  caloriesBurned?: number; // If user knows exact calories

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  date?: string;
}
