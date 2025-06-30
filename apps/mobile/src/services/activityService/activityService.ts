import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api';
import { ActivityData, ActivitySummary, AvailableApp } from './interfaces';

export enum ActivitySource {
  HUAWEI_HEALTH = 'huawei_health',
  GOOGLE_FIT = 'google_fit',
  SAMSUNG_HEALTH = 'samsung_health',
  APPLE_HEALTH = 'apple_health',
  MANUAL = 'manual',
  DEVICE_SENSORS = 'device_sensors',
}

class UnifiedActivityService {
  private connectedApps = new Set<ActivitySource>();

  constructor() {
    this.loadConnectedApps();
  }

  async syncToBackend(activityData: ActivityData): Promise<void> {
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
  }

  async getActivitySummary(date?: string): Promise<ActivitySummary> {
    try {
      const params = date ? { date } : {};
      const response = await apiClient.get('/activity/summary', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get activity summary:', error);
      throw error;
    }
  }

  async addManualActivity(activity: {
    activityType: string;
    duration: number;
    intensity: 'low' | 'moderate' | 'high';
    caloriesBurned?: number;
    notes?: string;
    date?: string;
  }): Promise<any> {
    try {
      const response = await apiClient.post('/activity/manual', activity);
      console.log('✅ Manual activity added via backend');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to add manual activity:', error);
      throw error;
    }
  }

  async getAvailableActivitySources(
    platform: 'ios' | 'android'
  ): Promise<AvailableApp[]> {
    try {
      return await apiClient.get('/activity/sources', {
        params: { platform },
      });
    } catch (error) {
      console.error('❌ Failed to get activity sources:', error);
      throw error;
    }
  }

  async updateActivityPreferences(preferences: {
    preferredActivitySource?: ActivitySource;
    enabledSources?: ActivitySource[];
    autoSyncEnabled?: boolean;
    syncFrequency?: number;
    activity_goal?: number;
  }): Promise<any> {
    try {
      const response = await apiClient.put(
        '/activity/preferences',
        preferences
      );
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update activity preferences:', error);
      throw error;
    }
  }

  async getActivityPreferences(): Promise<any> {
    try {
      const response = await apiClient.get('/activity/preferences');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get activity preferences:', error);
      throw error;
    }
  }

  private async loadConnectedApps(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('connected_health_apps');
      if (stored) {
        const apps = JSON.parse(stored);
        this.connectedApps = new Set(apps);
      }
    } catch (error) {
      console.error('Failed to load connected apps:', error);
    }
  }

  private async saveConnectedApps(): Promise<void> {
    try {
      const apps = Array.from(this.connectedApps);
      await AsyncStorage.setItem('connected_health_apps', JSON.stringify(apps));
    } catch (error) {
      console.error('Failed to save connected apps:', error);
    }
  }

  async connectApp(source: ActivitySource): Promise<void> {
    this.connectedApps.add(source);
    await this.saveConnectedApps();

    await this.updateActivityPreferences({
      preferredActivitySource: source,
      enabledSources: Array.from(this.connectedApps),
      autoSyncEnabled: true,
    });
  }

  async disconnectApp(source: ActivitySource): Promise<void> {
    this.connectedApps.delete(source);
    await this.saveConnectedApps();

    const enabledSources = Array.from(this.connectedApps);
    await this.updateActivityPreferences({
      preferredActivitySource:
        enabledSources.length > 0 ? enabledSources[0] : undefined,
      enabledSources,
      autoSyncEnabled: enabledSources.length > 0,
    });
  }

  async disconnectAllApps(): Promise<void> {
    this.connectedApps.clear();
    await AsyncStorage.removeItem('connected_health_apps');
    await AsyncStorage.removeItem('selectedHealthApp');
    await AsyncStorage.removeItem('healthAppConnected');

    await this.updateActivityPreferences({
      preferredActivitySource: undefined,
      enabledSources: [],
      autoSyncEnabled: false,
    });
  }

  getConnectedApps(): ActivitySource[] {
    return Array.from(this.connectedApps);
  }

  hasConnectedApps(): boolean {
    return this.connectedApps.size > 0;
  }

  isAppConnected(source: ActivitySource): boolean {
    return this.connectedApps.has(source);
  }

  calculateCaloriesFromActivity(activity: {
    activityType: string;
    duration: number;
    intensity: 'low' | 'moderate' | 'high';
  }): number {
    const baseMET = 3.5; // Base metabolic rate
    const intensityMultiplier = {
      low: 1.2,
      moderate: 1.5,
      high: 2.0,
    };

    const met = baseMET * intensityMultiplier[activity.intensity];
    const caloriesPerMinute = (met * 70 * 3.5) / 200;

    return Math.round(caloriesPerMinute * activity.duration);
  }

  async syncActivityData(date?: string): Promise<ActivitySummary> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      console.log(`🔄 Syncing activity data for ${targetDate}...`);

      const summary = await this.getActivitySummary(targetDate);

      return summary;
    } catch (error) {
      console.error('❌ Activity sync failed:', error);
      throw error;
    }
  }
}

export const unifiedActivityService = new UnifiedActivityService();
