import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { AiModule } from './ai/ai.module';
import { FoodModule } from './food/food.module';
import { UsersModule } from './users/users.module';
import { DailyLogsModule } from './daily-logs/daily-logs.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ActivityModule } from './activity/activity.module';

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
