import {
  IsOptional,
  IsNumber,
  IsEnum,
  IsString,
  Min,
  Max,
} from 'class-validator';
import {
  ActivityLevel,
  Gender,
  Goal,
} from 'src/common/interfaces/user.interface';

export class UpdateProfileDto {
  @IsOptional()
  @IsNumber()
  @Min(13)
  @Max(120)
  age?: number;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(250)
  height?: number; // cm

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(300)
  weight?: number; // kg

  @IsOptional()
  @IsEnum(Goal)
  goal?: Goal;

  @IsOptional()
  @IsEnum(ActivityLevel)
  activity_level?: ActivityLevel;
}
