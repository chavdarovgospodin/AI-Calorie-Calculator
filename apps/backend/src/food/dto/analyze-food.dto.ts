import { IsString, IsNotEmpty, MaxLength, Matches } from 'class-validator';

export class AnalyzeFoodTextDto {
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @MaxLength(300, { message: 'Description cannot exceed 300 characters' })
  @Matches(/^[a-zA-Zа-яА-Я0-9\s\.,\-\+\(\)]+$/, { 
    message: 'Description contains invalid characters' 
  })
  description: string;
}

export class AnalyzeFoodImageDto {
  @IsString({ message: 'Image data must be a string' })
  @IsNotEmpty({ message: 'Image data cannot be empty' })
  imageBase64: string;
}