import { Module } from '@nestjs/common';

import { AiModule } from '../ai/ai.module';
import { DatabaseModule } from '../database/database.module';

import { FoodController } from './food.controller';
import { FoodService } from './food.service';

@Module({
  imports: [DatabaseModule, AiModule],
  controllers: [FoodController],
  providers: [FoodService],
  exports: [FoodService],
})
export class FoodModule {}
