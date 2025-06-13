import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth-guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    this.logger.log(`Profile request from user: ${req.user.email}`);
    
    try {
      return await this.usersService.getUserProfile(req.user.id);
    } catch (error) {
      this.logger.error(`Failed to get profile: ${error.message}`);
      throw error;
    }
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() updateData: UpdateProfileDto) {
    this.logger.log(`Profile update request from user: ${req.user.email}`);
    
    try {
      return await this.usersService.updateProfile(req.user.id, updateData);
    } catch (error) {
      this.logger.error(`Failed to update profile: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  @Delete('profile')
  async deleteProfile(@Request() req) {
    this.logger.log(`Profile deletion request from user: ${req.user.email}`);
    
    try {
      return await this.usersService.deleteProfile(req.user.id);
    } catch (error) {
      this.logger.error(`Failed to delete profile: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  @Get('stats')
  async getUserStats(@Request() req) {
    this.logger.log(`Stats request from user: ${req.user.email}`);
    
    // Placeholder for user statistics
    return {
      message: 'User statistics endpoint - coming soon',
      user: req.user.email,
      features: [
        'Total food entries',
        'Average daily calories',
        'Weight progress',
        'Goal achievement rate'
      ]
    };
  }
}