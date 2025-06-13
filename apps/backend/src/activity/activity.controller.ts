import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Request,
  Query,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import {
  ActivitySyncDto,
  UserActivityPreferencesDto,
  ManualActivityEntryDto,
} from './dto/activity-sync.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth-guard';

@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  private readonly logger = new Logger(ActivityController.name);

  constructor(private readonly activityService: ActivityService) {}

  @Post('sync')
  async syncActivity(@Request() req, @Body() activityData: ActivitySyncDto) {
    this.logger.log(
      `Activity sync request from user: ${req.user.email}, source: ${activityData.source}`
    );

    try {
      return await this.activityService.syncActivityData(
        req.user.id,
        activityData
      );
    } catch (error) {
      this.logger.error(`Activity sync failed: ${error.message}`);
      throw error;
    }
  }

  @Get('summary')
  async getActivitySummary(@Request() req, @Query('date') date?: string) {
    this.logger.log(
      `Activity summary request from user: ${req.user.email}, date: ${date || 'today'}`
    );

    try {
      if (date) {
        return await this.activityService.getActivitySummary(req.user.id, date);
      } else {
        return await this.activityService.getTodayActivitySummary(req.user.id);
      }
    } catch (error) {
      this.logger.error(`Activity summary failed: ${error.message}`);
      throw error;
    }
  }

  @Get('preferences')
  async getPreferences(@Request() req) {
    this.logger.log(
      `Activity preferences request from user: ${req.user.email}`
    );

    try {
      return await this.activityService.getUserActivityPreferences(req.user.id);
    } catch (error) {
      this.logger.error(`Get preferences failed: ${error.message}`);
      throw error;
    }
  }

  @Put('preferences')
  async updatePreferences(
    @Request() req,
    @Body() preferences: UserActivityPreferencesDto
  ) {
    this.logger.log(`Update activity preferences from user: ${req.user.email}`);

    try {
      return await this.activityService.updateActivityPreferences(
        req.user.id,
        preferences
      );
    } catch (error) {
      this.logger.error(`Update preferences failed: ${error.message}`);
      throw error;
    }
  }

  @Post('manual')
  async addManualActivity(
    @Request() req,
    @Body() activityEntry: ManualActivityEntryDto
  ) {
    this.logger.log(
      `Manual activity entry from user: ${req.user.email}: ${activityEntry.activityType}`
    );

    try {
      return await this.activityService.addManualActivity(
        req.user.id,
        activityEntry
      );
    } catch (error) {
      this.logger.error(`Manual activity entry failed: ${error.message}`);
      throw error;
    }
  }

  @Get('sources')
  async getAvailableSources(@Query('platform') platform: 'ios' | 'android') {
    this.logger.log(`Available sources request for platform: ${platform}`);

    try {
      if (!platform || !['ios', 'android'].includes(platform)) {
        throw new BadRequestException('Platform must be "ios" or "android"');
      }

      return await this.activityService.getAvailableActivitySources(platform);
    } catch (error) {
      this.logger.error(`Get available sources failed: ${error.message}`);
      throw error;
    }
  }

  @Get('test-calculation')
  async testCalorieCalculation(
    @Query('activity') activity: string,
    @Query('duration') duration: string,
    @Query('intensity') intensity: 'low' | 'moderate' | 'high'
  ) {
    // Test endpoint for calorie calculation
    const testEntry: ManualActivityEntryDto = {
      activityType: activity || 'walking',
      duration: parseInt(duration) || 30,
      intensity: intensity || 'moderate',
    };

    return {
      activity: testEntry.activityType,
      duration: testEntry.duration,
      intensity: testEntry.intensity,
      estimatedCalories: this.calculateTestCalories(testEntry),
    };
  }

  private calculateTestCalories(activity: ManualActivityEntryDto): number {
    const baseCaloriesPerMinute = {
      walking: { low: 3, moderate: 4, high: 5 },
      running: { low: 8, moderate: 12, high: 16 },
      cycling: { low: 5, moderate: 8, high: 12 },
      swimming: { low: 6, moderate: 10, high: 14 },
      gym: { low: 4, moderate: 6, high: 8 },
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
}
