import { IsOptional, IsDateString, IsNumber, Min } from 'class-validator';

export class CreateDailyLogDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  total_calories_consumed?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  calories_burned?: number;
}

export class UpdateDailyLogDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  total_calories_consumed?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  calories_burned?: number;
}

export class DashboardResponseDto {
  date: string;
  dailyCalorieGoal: number;
  totalCaloriesConsumed: number;
  totalCaloriesBurned: number;
  netCalories: number;
  remainingCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  progressPercentage: number;
  goalStatus: 'under' | 'on_target' | 'over';
  foodEntries: any[];
  activityEntries: any[];
}
