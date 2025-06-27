import {
  IsEmail,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import {
  ActivityLevel,
  Gender,
  Goal,
} from 'src/common/interfaces/user.interface';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsNumber({}, { message: 'Age must be a number' })
  @Min(13, { message: 'You must be at least 13 years old' })
  @Max(120, { message: 'Please enter a valid age' })
  age: number;

  @IsEnum(Gender, { message: 'Gender must be male or female' })
  gender: Gender;

  @IsNumber({}, { message: 'Height must be a number' })
  @Min(100, { message: 'Height must be at least 100cm' })
  @Max(250, { message: 'Height must be less than 250cm' })
  height: number;

  @IsNumber({}, { message: 'Weight must be a number' })
  @Min(30, { message: 'Weight must be at least 30kg' })
  @Max(300, { message: 'Weight must be less than 300kg' })
  weight: number;

  @IsEnum(Goal, { message: 'Please select a valid goal' })
  goal: Goal;

  @IsOptional()
  @IsEnum(ActivityLevel, { message: 'Please select a valid activity level' })
  activity_level?: ActivityLevel;
}
