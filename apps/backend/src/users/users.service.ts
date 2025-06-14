import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { User } from 'src/common/interfaces/user.interface';
import { calculateDailyCalories } from 'src/common/utils';

import { SupabaseService } from '../database/supabase.service';

import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private supabaseService: SupabaseService) {}

  async getUserProfile(userId: string) {
    this.logger.log(`Getting profile for user: ${userId}`);

    try {
      const { data, error } = await this.supabaseService.client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
        this.logger.error(`Database error: ${error.message}`);
        throw error;
      }
      if (!data) {
        throw new NotFoundException('User profile not found');
      }
      this.logger.log(`Profile retrieved for user: ${data.email}`);
      return data;
    } catch (error) {
      this.logger.error(`Failed to get user profile: ${error.message}`);

      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to retrieve user profile');
    }
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    this.logger.log(`Updating profile for user: ${userId}`);

    try {
      // If weight or other factors change, recalculate daily calorie goal
      let updatedData = { ...updateData } as User;
      if (
        updateData.age ||
        updateData.gender ||
        updateData.height ||
        updateData.weight ||
        updateData.goal ||
        updateData.activity_level
      ) {
        // Get current user data to fill in missing values for calculation
        const currentUser = await this.getUserProfile(userId);
        const calculationData = {
          age: updateData.age || currentUser.age,
          gender: updateData.gender || currentUser.gender,
          height: updateData.height || currentUser.height,
          weight: updateData.weight || currentUser.weight,
          goal: updateData.goal || currentUser.goal,
          activity_level:
            updateData.activity_level || currentUser.activity_level,
        };
        const newCalorieGoal = calculateDailyCalories(
          calculationData.age,
          calculationData.gender,
          calculationData.height,
          calculationData.weight,
          calculationData.goal,
          calculationData.activity_level
        );
        updatedData.daily_calorie_goal = newCalorieGoal;
        this.logger.log(`Recalculated daily calorie goal: ${newCalorieGoal}`);
      }
      const { data, error } = await this.supabaseService.client
        .from('users')
        .update(updatedData)
        .eq('id', userId)
        .select()
        .single();
      if (error) {
        this.logger.error(`Database update error: ${error.message}`);
        throw error;
      }
      this.logger.log(`Profile updated successfully for user: ${userId}`);
      return data;
    } catch (error) {
      this.logger.error(`Failed to update profile: ${error.message}`);

      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to update user profile');
    }
  }

  async deleteProfile(userId: string) {
    this.logger.log(`Deleting profile for user: ${userId}`);

    try {
      const { error } = await this.supabaseService.client
        .from('users')
        .delete()
        .eq('id', userId);
      if (error) {
        this.logger.error(`Database delete error: ${error.message}`);
        throw error;
      }
      this.logger.log(`Profile deleted successfully for user: ${userId}`);
      return { success: true, message: 'Profile deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to delete profile: ${error.message}`);
      throw new Error('Failed to delete user profile');
    }
  }
}
