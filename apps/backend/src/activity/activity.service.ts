import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import {
  ActivitySyncDto,
  UserActivityPreferencesDto,
  ManualActivityEntryDto,
  ActivitySource,
} from './dto/activity-sync.dto';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(private supabaseService: SupabaseService) {}

  // Sync activity data from mobile app
  async syncActivityData(userId: string, activityData: ActivitySyncDto) {
    this.logger.log(
      `Syncing activity data for user ${userId} from ${activityData.source}`
    );

    try {
      const date = activityData.date || new Date().toISOString().split('T')[0];

      // Get or create daily log
      const dailyLog = await this.getOrCreateDailyLog(userId, date);

      // Check if activity entry already exists (prevent duplicates)
      const existingEntry = await this.findExistingActivityEntry(
        userId,
        dailyLog.id,
        activityData.source,
        activityData.externalId
      );

      if (existingEntry) {
        this.logger.log(`Updating existing activity entry ${existingEntry.id}`);
        return await this.updateActivityEntry(existingEntry.id, activityData);
      } else {
        this.logger.log(
          `Creating new activity entry for ${activityData.source}`
        );
        return await this.createActivityEntry(
          userId,
          dailyLog.id,
          activityData
        );
      }
    } catch (error) {
      this.logger.error(`Failed to sync activity data: ${error.message}`);
      throw new BadRequestException('Failed to sync activity data');
    }
  }

  // Get user's activity preferences
  async getUserActivityPreferences(userId: string) {
    this.logger.log(`Getting activity preferences for user ${userId}`);

    try {
      const { data, error } = await this.supabaseService.client
        .from('user_activity_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found
        throw error;
      }

      if (!data) {
        // Create default preferences
        return await this.createDefaultActivityPreferences(userId);
      }

      return data;
    } catch (error) {
      this.logger.error(`Failed to get activity preferences: ${error.message}`);
      throw error;
    }
  }

  // Update user's activity preferences
  async updateActivityPreferences(
    userId: string,
    preferences: UserActivityPreferencesDto
  ) {
    this.logger.log(`Updating activity preferences for user ${userId}`);

    try {
      const { data, error } = await this.supabaseService.client
        .from('user_activity_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      this.logger.log(`Activity preferences updated for user ${userId}`);
      return data;
    } catch (error) {
      this.logger.error(
        `Failed to update activity preferences: ${error.message}`
      );
      throw new BadRequestException('Failed to update activity preferences');
    }
  }

  // Manual activity entry
  async addManualActivity(
    userId: string,
    activityEntry: ManualActivityEntryDto
  ) {
    this.logger.log(
      `Adding manual activity for user ${userId}: ${activityEntry.activityType}`
    );

    try {
      const date = activityEntry.date || new Date().toISOString().split('T')[0];
      const dailyLog = await this.getOrCreateDailyLog(userId, date);

      // Calculate calories if not provided
      const caloriesBurned =
        activityEntry.caloriesBurned ||
        this.calculateCaloriesFromActivity(activityEntry);

      const activityData: ActivitySyncDto = {
        source: ActivitySource.MANUAL,
        caloriesBurned,
        activityType: activityEntry.activityType,
        duration: activityEntry.duration,
        date,
      };

      const result = await this.createActivityEntry(
        userId,
        dailyLog.id,
        activityData
      );

      // Add notes if provided
      if (activityEntry.notes) {
        await this.supabaseService.client
          .from('activity_entries')
          .update({ notes: activityEntry.notes })
          .eq('id', result.id);
      }

      this.logger.log(`Manual activity added: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to add manual activity: ${error.message}`);
      throw new BadRequestException('Failed to add manual activity');
    }
  }

  // Get today's activity summary
  async getTodayActivitySummary(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    return await this.getActivitySummary(userId, today);
  }

  // Get activity summary for specific date
  async getActivitySummary(userId: string, date: string) {
    this.logger.log(`Getting activity summary for user ${userId} on ${date}`);

    try {
      const { data: dailyLog } = await this.supabaseService.client
        .from('daily_logs')
        .select(
          `
          *,
          activity_entries(*)
        `
        )
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (!dailyLog) {
        return {
          date,
          totalCaloriesBurned: 0,
          totalSteps: 0,
          totalDistance: 0,
          activities: [],
          lastSync: null,
          source: null,
        };
      }

      // Calculate totals
      const activities = dailyLog.activity_entries || [];
      const totalCaloriesBurned = activities.reduce(
        (sum: number, entry: any) => sum + (entry.calories_burned || 0),
        0
      );

      const totalSteps = activities.reduce(
        (sum: number, entry: any) => sum + (entry.steps || 0),
        0
      );

      const totalDistance = activities.reduce(
        (sum: number, entry: any) => sum + (entry.distance || 0),
        0
      );

      // Find most recent activity source
      const latestActivity = activities.sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      return {
        date,
        totalCaloriesBurned: Math.round(totalCaloriesBurned),
        totalSteps: Math.round(totalSteps),
        totalDistance: Math.round(totalDistance * 100) / 100, // Round to 2 decimals
        activities: activities.map(this.formatActivityEntry),
        lastSync: dailyLog.last_activity_sync,
        source: latestActivity?.activity_source || dailyLog.activity_source,
      };
    } catch (error) {
      this.logger.error(`Failed to get activity summary: ${error.message}`);
      throw new BadRequestException('Failed to get activity summary');
    }
  }

  // Get available activity sources for user's device
  async getAvailableActivitySources(platform: 'ios' | 'android') {
    const sources = {
      ios: [
        {
          source: ActivitySource.HEALTHKIT,
          name: 'Apple Health',
          description: 'Integrates with all iOS health apps',
        },
        {
          source: ActivitySource.DEVICE_SENSORS,
          name: 'iPhone Sensors',
          description: 'Built-in step counter and motion sensors',
        },
        {
          source: ActivitySource.MANUAL,
          name: 'Manual Entry',
          description: 'Manually log your activities',
        },
      ],
      android: [
        {
          source: ActivitySource.GOOGLEFIT,
          name: 'Google Fit',
          description: 'Integrates with most Android fitness apps',
        },
        {
          source: ActivitySource.SAMSUNG_HEALTH,
          name: 'Samsung Health',
          description: 'Direct Samsung Health integration',
        },
        {
          source: ActivitySource.HUAWEI_HEALTH,
          name: 'Huawei Health',
          description: 'Direct Huawei Health integration',
        },
        {
          source: ActivitySource.DEVICE_SENSORS,
          name: 'Device Sensors',
          description: 'Built-in step counter and sensors',
        },
        {
          source: ActivitySource.MANUAL,
          name: 'Manual Entry',
          description: 'Manually log your activities',
        },
      ],
    };

    return sources[platform] || sources.android;
  }

  // Private helper methods
  private async getOrCreateDailyLog(userId: string, date: string) {
    let { data: dailyLog } = await this.supabaseService.client
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (!dailyLog) {
      const { data: newLog, error } = await this.supabaseService.client
        .from('daily_logs')
        .insert({
          user_id: userId,
          date,
          total_calories_consumed: 0,
          calories_burned: 0,
        })
        .select()
        .single();

      if (error) throw error;
      dailyLog = newLog;
    }

    return dailyLog;
  }

  private async findExistingActivityEntry(
    userId: string,
    dailyLogId: string,
    source: ActivitySource,
    externalId?: string
  ) {
    if (!externalId) return null;

    const { data } = await this.supabaseService.client
      .from('activity_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('daily_log_id', dailyLogId)
      .eq('activity_source', source)
      .eq('external_id', externalId)
      .single();

    return data;
  }

  private async createActivityEntry(
    userId: string,
    dailyLogId: string,
    activityData: ActivitySyncDto
  ) {
    const { data, error } = await this.supabaseService.client
      .from('activity_entries')
      .insert({
        user_id: userId,
        daily_log_id: dailyLogId,
        activity_type: activityData.activityType || 'general',
        duration: activityData.duration || null,
        calories_burned: activityData.caloriesBurned,
        activity_source: activityData.source,
        external_id: activityData.externalId || null,
        steps: activityData.steps || null,
        distance: activityData.distance || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async updateActivityEntry(
    entryId: string,
    activityData: ActivitySyncDto
  ) {
    const { data, error } = await this.supabaseService.client
      .from('activity_entries')
      .update({
        calories_burned: activityData.caloriesBurned,
        duration: activityData.duration,
        steps: activityData.steps,
        distance: activityData.distance,
        sync_timestamp: new Date().toISOString(),
      })
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async createDefaultActivityPreferences(userId: string) {
    const { data, error } = await this.supabaseService.client
      .from('user_activity_preferences')
      .insert({
        user_id: userId,
        preferred_activity_source: null,
        enabled_sources: [],
        auto_sync_enabled: true,
        sync_frequency: 'realtime',
        calorie_calculation_method: 'estimated',
        activity_goal: 600,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private calculateCaloriesFromActivity(
    activity: ManualActivityEntryDto
  ): number {
    // Simple calorie calculation based on activity type and intensity
    const baseCaloriesPerMinute = {
      walking: { low: 3, moderate: 4, high: 5 },
      running: { low: 8, moderate: 12, high: 16 },
      cycling: { low: 5, moderate: 8, high: 12 },
      swimming: { low: 6, moderate: 10, high: 14 },
      gym: { low: 4, moderate: 6, high: 8 },
      sports: { low: 6, moderate: 9, high: 12 },
      yoga: { low: 2, moderate: 3, high: 4 },
      dancing: { low: 3, moderate: 5, high: 7 },
      cleaning: { low: 2, moderate: 3, high: 4 },
      gardening: { low: 3, moderate: 4, high: 5 },
    };

    const activityKey = activity.activityType.toLowerCase();
    const rates = baseCaloriesPerMinute[activityKey] || {
      low: 3,
      moderate: 4,
      high: 5,
    };
    const caloriesPerMinute = rates[activity.intensity];

    return Math.round(activity.duration * caloriesPerMinute);
  }

  private formatActivityEntry(entry: any) {
    return {
      id: entry.id,
      activityType: entry.activity_type,
      duration: entry.duration,
      caloriesBurned: entry.calories_burned,
      source: entry.activity_source,
      steps: entry.steps,
      distance: entry.distance,
      createdAt: entry.created_at,
      notes: entry.notes,
    };
  }
}
