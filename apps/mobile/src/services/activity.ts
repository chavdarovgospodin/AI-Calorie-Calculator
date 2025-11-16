import { apiClient } from './api';

// ============================================================================
// TYPES (temporary - ще ги преместим в types/health.ts после)
// ============================================================================

export enum ActivitySource {
  HEALTHKIT = 'healthkit',
  GOOGLEFIT = 'googlefit',
  SAMSUNG_HEALTH = 'samsung_health',
  HUAWEI_HEALTH = 'huawei_health',
  DEVICE_SENSORS = 'device_sensors',
  MANUAL = 'manual',
}

export interface ActivitySyncData {
  source: ActivitySource;
  caloriesBurned: number;
  steps?: number;
  distance?: number;
  duration?: number;
  externalId?: string;
  activityType?: string;
  date?: string;
}

export interface ActivitySummary {
  date: string;
  totalCaloriesBurned: number;
  totalSteps: number;
  totalDistance: number;
  activities: any[];
  lastSync: string | null;
  source: ActivitySource | null;
}

export interface ActivityPreferences {
  preferredActivitySource?: ActivitySource;
  enabledSources?: ActivitySource[];
  autoSyncEnabled?: boolean;
  syncFrequency?: 'realtime' | 'hourly' | 'daily';
  activityGoal?: number;
}

export interface ManualActivityInput {
  activityType: string;
  duration: number;
  intensity: 'low' | 'moderate' | 'high';
  caloriesBurned?: number;
  notes?: string;
  date?: string;
}

// ============================================================================
// ACTIVITY SYNC API
// ============================================================================

/**
 * Sync activity data to backend
 */
export const syncActivityToBackend = async (
  activityData: ActivitySyncData
): Promise<any> => {
  try {
    const response = await apiClient.post('/activity/sync', {
      source: activityData.source,
      caloriesBurned: activityData.caloriesBurned,
      steps: activityData.steps,
      distance: activityData.distance,
      duration: activityData.duration,
      externalId: activityData.externalId,
      activityType: activityData.activityType,
      date: activityData.date,
    });
    console.log('✅ Activity synced to backend');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to sync activity to backend:', error);
    throw error;
  }
};

/**
 * Get activity summary from backend
 */
export const getActivitySummary = async (
  date?: string
): Promise<ActivitySummary> => {
  try {
    const params = date ? { date } : {};
    const response = await apiClient.get('/activity/summary', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get activity summary:', error);
    throw error;
  }
};

// ============================================================================
// MANUAL ACTIVITY API
// ============================================================================

/**
 * Add manual activity entry via backend
 */
export const addManualActivity = async (
  activity: ManualActivityInput
): Promise<any> => {
  try {
    const response = await apiClient.post('/activity/manual', activity);
    console.log('✅ Manual activity added via backend');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to add manual activity:', error);
    throw error;
  }
};

// ============================================================================
// ACTIVITY SOURCES API
// ============================================================================

/**
 * Get available activity sources for platform
 */
export const getAvailableActivitySources = async (
  platform: 'ios' | 'android'
): Promise<any[]> => {
  try {
    const response = await apiClient.get(`/activity/sources/${platform}`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get activity sources:', error);
    throw error;
  }
};

// ============================================================================
// ACTIVITY PREFERENCES API
// ============================================================================

/**
 * Get user's activity preferences
 */
export const getActivityPreferences =
  async (): Promise<ActivityPreferences> => {
    try {
      const response = await apiClient.get('/activity/preferences');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get activity preferences:', error);
      throw error;
    }
  };

/**
 * Update user's activity preferences
 */
export const updateActivityPreferences = async (
  preferences: ActivityPreferences
): Promise<any> => {
  try {
    const response = await apiClient.put('/activity/preferences', preferences);
    console.log('✅ Activity preferences updated');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to update activity preferences:', error);
    throw error;
  }
};

// ============================================================================
// ACTIVITY HISTORY API
// ============================================================================

/**
 * Get activity history for a date range
 */
export const getActivityHistory = async (
  startDate: string,
  endDate: string
): Promise<any[]> => {
  try {
    const response = await apiClient.get('/activity/history', {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get activity history:', error);
    throw error;
  }
};

/**
 * Delete activity entry
 */
export const deleteActivityEntry = async (entryId: string): Promise<void> => {
  try {
    await apiClient.delete(`/activity/entries/${entryId}`);
    console.log('✅ Activity entry deleted');
  } catch (error) {
    console.error('❌ Failed to delete activity entry:', error);
    throw error;
  }
};
