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

export class FoodEntryDto {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
  created_at: string;
  description?: string;
}

export class ActivityEntryDto {
  id: string;
  activity_type: string;
  duration: number;
  calories_burned: number;
  created_at: string;
}

export class MacrosDto {
  protein: number;
  carbs: number;
  fat: number;
}

export class DashboardResponseDto {
  date: string;
  dailyCalorieGoal: number;
  totalCaloriesConsumed: number;
  totalCaloriesBurned: number;
  netCalories: number;
  remainingCalories: number;
  macros: MacrosDto;
  progressPercentage: number;
  goalStatus: 'under' | 'on_target' | 'over';
  foodEntries: FoodEntryDto[];
  activityEntries: ActivityEntryDto[];
  targetCalories: number;
  caloriesBurned: number;
}
