import { Module } from '@nestjs/common';
import { ActivityModule } from 'src/activity/activity.module';

import { DatabaseModule } from '../database/database.module';

import { DailyLogsController } from './daily-logs.controller';
import { DailyLogsService } from './daily-logs.service';

@Module({
  imports: [DatabaseModule, ActivityModule],
  controllers: [DailyLogsController],
  providers: [DailyLogsService],
  exports: [DailyLogsService],
})
export class DailyLogsModule {}
