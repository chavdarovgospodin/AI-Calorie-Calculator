import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Request,
  Query,
  UploadedFile,
  UseInterceptors,
  Param,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FoodService } from './food.service';
import { AnalyzeFoodTextDto } from './dto/analyze-food.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth-guard';
import { Throttle } from '@nestjs/throttler';

@Controller('food')
@UseGuards(JwtAuthGuard)
export class FoodController {
  private readonly logger = new Logger(FoodController.name);

  constructor(private readonly foodService: FoodService) {}

  @Post('analyze/text')
  @Throttle({ default: { limit: 8, ttl: 60000 } }) // 8 per minute for text
  async analyzeTextFood(@Request() req, @Body() analyzeDto: AnalyzeFoodTextDto) {
    this.logger.log(`Text analysis request from user: ${req.user.email}`);
    
    try {
      return await this.foodService.analyzeTextFood(req.user.id, analyzeDto.description);
    } catch (error) {
      this.logger.error(`Text analysis failed: ${error.message}`);
      throw error;
    }
  }

  @Post('analyze/image')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 per minute for images
  @UseInterceptors(FileInterceptor('image'))
  async analyzeImageFood(@Request() req, @UploadedFile() file: Express.Multer.File) {
    this.logger.log(`Image analysis request from user: ${req.user.email}`);

    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Please upload JPEG, PNG or WebP image');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File too large. Maximum size is 10MB');
    }

    try {
      const imageBase64 = file.buffer.toString('base64');
      return await this.foodService.analyzeImageFood(req.user.id, imageBase64);
    } catch (error) {
      this.logger.error(`Image analysis failed: ${error.message}`);
      throw error;
    }
  }

  @Get('entries')
  async getFoodEntries(@Request() req, @Query('date') date?: string) {
    this.logger.log(`Getting food entries for user: ${req.user.email}, date: ${date || 'today'}`);
    
    try {
      return await this.foodService.getUserFoodEntries(req.user.id, date);
    } catch (error) {
      this.logger.error(`Failed to get food entries: ${error.message}`);
      throw error;
    }
  }

  @Delete('entries/:id')
  async deleteFoodEntry(@Request() req, @Param('id') entryId: string) {
    this.logger.log(`Deleting food entry ${entryId} for user: ${req.user.email}`);
    
    try {
      return await this.foodService.deleteFoodEntry(req.user.id, entryId);
    } catch (error) {
      this.logger.error(`Failed to delete food entry: ${error.message}`);
      throw error;
    }
  }

  @Get('stats')
  async getFoodStats(@Request() req, @Query('days') days: string = '7') {
    this.logger.log(`Getting food stats for user: ${req.user.email}, days: ${days}`);
    
    // Simple stats endpoint for future use
    return {
      message: 'Food stats endpoint - coming soon',
      user: req.user.email,
      days: parseInt(days),
    };
  }
}