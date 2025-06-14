import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth-guard';

import { DailyLogsService } from './daily-logs.service';
import { CreateDailyLogDto } from './dto/daily-log.dto';
import { WeeklyLogEntry } from './interfaces/WeeklyLogEntry';

@Controller('daily-logs')
@UseGuards(JwtAuthGuard)
export class DailyLogsController {
  private readonly logger = new Logger(DailyLogsController.name);

  constructor(private readonly dailyLogsService: DailyLogsService) {}

  @Get('dashboard')
  async getDashboard(@Request() req, @Query('date') date?: string) {
    this.logger.log(
      `Dashboard request from user: ${req.user.email}, date: ${date || 'today'}`
    );

    try {
      return await this.dailyLogsService.getDashboardData(req.user.id, date);
    } catch (error) {
      this.logger.error(`Dashboard request failed: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  @Get('daily')
  async getDailyLog(@Request() req, @Query('date') date?: string) {
    this.logger.log(
      `Daily log request from user: ${req.user.email}, date: ${date || 'today'}`
    );

    try {
      return await this.dailyLogsService.getDailyLog(req.user.id, date);
    } catch (error) {
      this.logger.error(`Daily log request failed: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  @Get('weekly')
  async getWeeklyLogs(
    @Request() req,
    @Query('startDate') startDate?: string
  ): Promise<WeeklyLogEntry[]> {
    this.logger.log(
      `Weekly logs request from user: ${req.user.email}, startDate: ${startDate || 'this week'}`
    );

    try {
      return await this.dailyLogsService.getWeeklyLogs(req.user.id, startDate);
    } catch (error) {
      this.logger.error(`Weekly logs request failed: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  @Get('monthly')
  async getMonthlyStats(
    @Request() req,
    @Query('year') year?: string,
    @Query('month') month?: string
  ) {
    this.logger.log(
      `Monthly stats request from user: ${req.user.email}, year: ${year}, month: ${month}`
    );

    try {
      const yearNum = year ? parseInt(year) : undefined;
      const monthNum = month ? parseInt(month) : undefined;
      return await this.dailyLogsService.getMonthlyStats(
        req.user.id,
        yearNum,
        monthNum
      );
    } catch (error) {
      this.logger.error(`Monthly stats request failed: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  @Post()
  async createDailyLog(@Request() req, @Body() createData: CreateDailyLogDto) {
    this.logger.log(`Create daily log request from user: ${req.user.email}`);

    try {
      return await this.dailyLogsService.createDailyLog(
        req.user.id,
        createData
      );
    } catch (error) {
      this.logger.error(`Create daily log failed: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  @Get('progress')
  async getProgress(@Request() req, @Query('days') days: string = '30') {
    this.logger.log(
      `Progress request from user: ${req.user.email}, days: ${days}`
    );

    try {
      // Simple progress calculation
      const daysNum = parseInt(days) || 30;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - daysNum);
      // This would ideally calculate weight progress, goal adherence, etc.
      return {
        message: 'Progress tracking endpoint',
        user: req.user.email,
        period: `${daysNum} days`,
        features: [
          'Weight progress tracking',
          'Goal adherence percentage',
          'Average daily calories',
          'Macro balance trends',
        ],
        note: 'Full implementation coming with weight tracking feature',
      };
    } catch (error) {
      this.logger.error(`Progress request failed: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  @Get('enhanced-dashboard')
  async getEnhancedDashboardData(@Request() req, @Query('date') date?: string) {
    this.logger.log(
      `Enhanced Dashboard for: ${req.user.email}, date: ${date || 'today'}`
    );

    try {
      return await this.dailyLogsService.getEnhancedDashboardData(
        req.user.id,
        date
      );
    } catch (error) {
      this.logger.error(`Enhanced Dashboard request failed: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }
}
