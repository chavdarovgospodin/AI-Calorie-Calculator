import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ActivityService } from 'src/activity/activity.service';

import { SupabaseService } from '../database/supabase.service';

import { CreateDailyLogDto, DashboardResponseDto } from './dto/daily-log.dto';
import { WeeklyLogEntry } from './interfaces/WeeklyLogEntry';

@Injectable()
export class DailyLogsService {
  private readonly logger = new Logger(DailyLogsService.name);

  constructor(
    private supabaseService: SupabaseService,
    private activityService: ActivityService
  ) {}

  async getDailyLog(userId: string, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    this.logger.log(`Getting daily log for user ${userId} on ${targetDate}`);

    try {
      let { data: dailyLog } = await this.supabaseService.client
        .from('daily_logs')
        .select(
          `
          *,
          food_entries(*),
          activity_entries(*)
        `
        )
        .eq('user_id', userId)
        .eq('date', targetDate)
        .single();
      if (!dailyLog) {
        this.logger.log(
          `Creating new daily log for user ${userId} on ${targetDate}`
        );
        const { data: newLog, error } = await this.supabaseService.client
          .from('daily_logs')
          .insert({
            user_id: userId,
            date: targetDate,
            total_calories_consumed: 0,
            calories_burned: 0,
          })
          .select(
            `
            *,
            food_entries(*),
            activity_entries(*)
          `
          )
          .single();
        if (error) throw error;
        dailyLog = newLog;
      }
      return dailyLog;
    } catch (error) {
      this.logger.error(`Failed to get daily log: ${error.message}`);
      throw new Error('Failed to retrieve daily log');
    }
  }

  async getDashboardData(
    userId: string,
    date?: string
  ): Promise<DashboardResponseDto> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    this.logger.log(
      `Getting dashboard data for user ${userId} on ${targetDate}`
    );

    try {
      // Get user's daily calorie goal
      const { data: user, error: userError } = await this.supabaseService.client
        .from('users')
        .select('daily_calorie_goal, goal')
        .eq('id', userId)
        .single();
      if (userError || !user) {
        throw new NotFoundException('User not found');
      }
      // Get today's log with related data
      const dailyLog = await this.getDailyLog(userId, targetDate);
      // Calculate totals from actual food entries
      const totalCaloriesConsumed =
        dailyLog.food_entries?.reduce(
          (sum: number, entry: any) => sum + (entry.calories || 0),
          0
        ) || 0;
      const totalCaloriesBurned =
        dailyLog.activity_entries?.reduce(
          (sum: number, entry: any) => sum + (entry.calories_burned || 0),
          0
        ) || 0;
      // Calculate macros
      const totalProtein =
        dailyLog.food_entries?.reduce(
          (sum: number, entry: any) => sum + (entry.protein || 0),
          0
        ) || 0;
      const totalCarbs =
        dailyLog.food_entries?.reduce(
          (sum: number, entry: any) => sum + (entry.carbs || 0),
          0
        ) || 0;
      const totalFat =
        dailyLog.food_entries?.reduce(
          (sum: number, entry: any) => sum + (entry.fat || 0),
          0
        ) || 0;
      // Calculate metrics
      const netCalories = totalCaloriesConsumed - totalCaloriesBurned;
      const remainingCalories = user.daily_calorie_goal - netCalories;
      const progressPercentage = Math.min(
        Math.round((netCalories / user.daily_calorie_goal) * 100),
        100
      );
      // Determine goal status
      let goalStatus: 'under' | 'on_target' | 'over' = 'under';
      const tolerance = user.daily_calorie_goal * 0.05; // 5% tolerance
      if (netCalories > user.daily_calorie_goal + tolerance) {
        goalStatus = 'over';
      } else if (netCalories >= user.daily_calorie_goal - tolerance) {
        goalStatus = 'on_target';
      }
      this.logger.log(
        `Dashboard calculated: ${netCalories}/${user.daily_calorie_goal} calories (${progressPercentage}%)`
      );
      return {
        date: targetDate,
        dailyCalorieGoal: user.daily_calorie_goal,
        totalCaloriesConsumed,
        totalCaloriesBurned,
        netCalories,
        remainingCalories,
        macros: {
          protein: Math.round(totalProtein * 10) / 10,
          carbs: Math.round(totalCarbs * 10) / 10,
          fat: Math.round(totalFat * 10) / 10,
        },
        progressPercentage,
        goalStatus,
        foodEntries: dailyLog.food_entries || [],
        activityEntries: dailyLog.activity_entries || [],
      };
    } catch (error) {
      this.logger.error(`Failed to get dashboard data: ${error.message}`);
      throw error;
    }
  }

  async getWeeklyLogs(userId: string, startDate?: string) {
    const endDate = startDate ? new Date(startDate) : new Date();
    const start = new Date(endDate);
    start.setDate(endDate.getDate() - 6); // 7 days total

    this.logger.log(
      `Getting weekly logs for user ${userId} from ${start.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`
    );

    try {
      const { data: logs, error } = await this.supabaseService.client
        .from('daily_logs')
        .select(
          `
          date,
          total_calories_consumed,
          calories_burned,
          food_entries(calories, protein, carbs, fat)
        `
        )
        .eq('user_id', userId)
        .gte('date', start.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });
      if (error) throw error;

      // Fill in missing dates with empty data
      const weeklyData: WeeklyLogEntry[] = [];
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        const existingLog = logs?.find(log => log.date === dateStr);
        if (existingLog) {
          // Calculate totals from food entries
          const totalCalories =
            existingLog.food_entries?.reduce(
              (sum: number, entry: any) => sum + (entry.calories || 0),
              0
            ) || 0;
          const totalProtein =
            existingLog.food_entries?.reduce(
              (sum: number, entry: any) => sum + (entry.protein || 0),
              0
            ) || 0;
          weeklyData.push({
            date: dateStr,
            totalCaloriesConsumed: totalCalories,
            totalCaloriesBurned: existingLog.calories_burned || 0,
            netCalories: totalCalories - (existingLog.calories_burned || 0),
            macros: {
              protein: totalProtein,
              carbs:
                existingLog.food_entries?.reduce(
                  (sum: number, entry: any) => sum + (entry.carbs || 0),
                  0
                ) || 0,
              fat:
                existingLog.food_entries?.reduce(
                  (sum: number, entry: any) => sum + (entry.fat || 0),
                  0
                ) || 0,
            },
          });
        } else {
          weeklyData.push({
            date: dateStr,
            totalCaloriesConsumed: 0,
            totalCaloriesBurned: 0,
            netCalories: 0,
            macros: { protein: 0, carbs: 0, fat: 0 },
          });
        }
      }
      this.logger.log(`Retrieved ${weeklyData.length} days of weekly data`);
      return weeklyData;
    } catch (error) {
      this.logger.error(`Failed to get weekly logs: ${error.message}`);
      throw new Error('Failed to retrieve weekly logs');
    }
  }

  async getMonthlyStats(userId: string, year?: number, month?: number) {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;
    const startDate = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`;
    const endDate = new Date(targetYear, targetMonth, 0)
      .toISOString()
      .split('T')[0];
    this.logger.log(
      `Getting monthly stats for user ${userId} for ${targetYear}-${targetMonth}`
    );

    try {
      const { data: logs, error } = await this.supabaseService.client
        .from('daily_logs')
        .select(
          `
          date,
          total_calories_consumed,
          calories_burned,
          food_entries(calories)
        `
        )
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate);
      if (error) throw error;

      const totalDays = logs?.length || 0;
      const totalCaloriesConsumed =
        logs?.reduce((sum, log) => {
          const dayCalories =
            log.food_entries?.reduce(
              (daySum: number, entry: any) => daySum + (entry.calories || 0),
              0
            ) || 0;
          return sum + dayCalories;
        }, 0) || 0;
      const totalCaloriesBurned =
        logs?.reduce((sum, log) => sum + (log.calories_burned || 0), 0) || 0;
      const averageDaily =
        totalDays > 0 ? Math.round(totalCaloriesConsumed / totalDays) : 0;
      return {
        year: targetYear,
        month: targetMonth,
        totalDays,
        totalCaloriesConsumed,
        totalCaloriesBurned,
        averageDailyCalories: averageDaily,
        netCalories: totalCaloriesConsumed - totalCaloriesBurned,
      };
    } catch (error) {
      this.logger.error(`Failed to get monthly stats: ${error.message}`);
      throw new Error('Failed to retrieve monthly statistics');
    }
  }

  async createDailyLog(userId: string, createData: CreateDailyLogDto) {
    const date = createData.date || new Date().toISOString().split('T')[0];
    this.logger.log(`Creating daily log for user ${userId} on ${date}`);

    try {
      const { data, error } = await this.supabaseService.client
        .from('daily_logs')
        .insert({
          user_id: userId,
          date,
          total_calories_consumed: createData.total_calories_consumed || 0,
          calories_burned: createData.calories_burned || 0,
        })
        .select()
        .single();
      if (error) throw error;

      this.logger.log(`Daily log created with ID: ${data.id}`);
      return data;
    } catch (error) {
      this.logger.error(`Failed to create daily log: ${error.message}`);
      throw new Error('Failed to create daily log');
    }
  }

  async getEnhancedDashboardData(userId: string, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    try {
      // Get existing dashboard data
      const dashboardData = await this.getDashboardData(userId, targetDate);
      // Get activity summary
      const activitySummary = await this.activityService.getActivitySummary(
        userId,
        targetDate
      );
      // Get user's activity goal
      const activityPreferences =
        await this.activityService.getUserActivityPreferences(userId);
      return {
        ...dashboardData,
        activityData: {
          totalCaloriesBurned: activitySummary.totalCaloriesBurned,
          activityGoal: activityPreferences.activity_goal || 600,
          totalSteps: activitySummary.totalSteps,
          totalDistance: activitySummary.totalDistance,
          source: activitySummary.source,
          lastSync: activitySummary.lastSync,
          activities: activitySummary.activities,
        },
        calorieDifference:
          dashboardData.totalCaloriesConsumed -
          activitySummary.totalCaloriesBurned,
        isActiveDay:
          activitySummary.totalCaloriesBurned >=
          (activityPreferences.activity_goal || 600) * 0.8,
      };
    } catch (error) {
      this.logger.error(`Failed to get enhanced dashboard: ${error.message}`);
      throw error;
    }
  }
}
