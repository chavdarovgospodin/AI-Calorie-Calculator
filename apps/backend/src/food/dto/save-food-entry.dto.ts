import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsNotEmpty,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FoodItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  quantity: string;

  @IsNumber()
  @Min(0)
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
}

export class SaveFoodEntryDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  @Max(10000)
  totalCalories: number;

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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FoodItemDto)
  foods?: FoodItemDto[];

  @IsOptional()
  @IsString()
  date?: string;
}
