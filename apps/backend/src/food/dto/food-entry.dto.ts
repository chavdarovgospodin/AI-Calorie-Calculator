import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';

export class CreateFoodEntryDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0, { message: 'Calories must be positive' })
  @Max(10000, { message: 'Calories seem too high' })
  calories: number;

  @IsNumber()
  @Min(0)
  protein: number;

  @IsNumber()
  @Min(0)
  carbs: number;

  @IsNumber()
  @Min(0)
  fat: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fiber?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sugar?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sodium?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  ai_model_used?: string;
}
