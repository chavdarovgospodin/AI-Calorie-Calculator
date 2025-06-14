import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { ActivityModule } from './activity/activity.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { DailyLogsModule } from './daily-logs/daily-logs.module';
import { DatabaseModule } from './database/database.module';
import { FoodModule } from './food/food.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
      ignoreEnvFile: false,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60 * 1000, // 1 minute
          limit: 100, // default limit
        },
      ],
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    AiModule,
    FoodModule,
    DailyLogsModule,
    ActivityModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
