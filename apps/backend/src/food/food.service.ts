import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { AiService } from '../ai/ai.service';
import { CreateFoodEntryDto } from './dto/food-entry.dto';
import { NutritionAnalysis } from 'src/ai/interfaces/nutrition-analysis.interface';

@Injectable()
export class FoodService {
  private readonly logger = new Logger(FoodService.name);

  constructor(
    private supabaseService: SupabaseService,
    private aiService: AiService,
  ) {}

  async analyzeTextFood(userId: string, description: string): Promise<NutritionAnalysis> {
    this.logger.log(`Analyzing text food for user ${userId}: ${description}`);

    try {
      // Call AI service
      const analysis = await this.aiService.analyzeTextFood(description);
      
      // Save to database
      const foodEntry = await this.saveFoodEntry(userId, {
        description,
        calories: analysis.totalCalories,
        protein: analysis.protein,
        carbs: analysis.carbs,
        fat: analysis.fat,
        fiber: analysis.fiber || 0,
        sugar: analysis.sugar || 0,
        sodium: analysis.sodium || 0,
        ai_model_used: 'gemini-1.5-flash-text',
      });

      this.logger.log(`Food entry saved with ID: ${foodEntry.id}`);
      return analysis;
    } catch (error) {
      this.logger.error(`Text food analysis failed: ${error.message}`);
      throw new BadRequestException('Failed to analyze food description');
    }
  }

  async analyzeImageFood(userId: string, imageBase64: string): Promise<NutritionAnalysis> {
    this.logger.log(`Analyzing image food for user ${userId}`);

    try {
      // Validate base64 image
      if (!imageBase64.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
        throw new Error('Invalid base64 image format');
      }

      const analysis = await this.aiService.analyzeImageFood(imageBase64);
      
      // Save to database
      const foodEntry = await this.saveFoodEntry(userId, {
        description: `Food from image - ${analysis.foods.map(f => f.name).join(', ')}`,
        calories: analysis.totalCalories,
        protein: analysis.protein,
        carbs: analysis.carbs,
        fat: analysis.fat,
        fiber: analysis.fiber || 0,
        sugar: analysis.sugar || 0,
        sodium: analysis.sodium || 0,
        ai_model_used: 'gemini-1.5-flash-image',
      });

      this.logger.log(`Image food entry saved with ID: ${foodEntry.id}`);
      return analysis;
    } catch (error) {
      this.logger.error(`Image food analysis failed: ${error.message}`);
      throw new BadRequestException('Failed to analyze food image');
    }
  }

  async saveFoodEntry(userId: string, foodEntry: CreateFoodEntryDto) {
    const today = foodEntry.date || new Date().toISOString().split('T')[0];
    
    try {
      // Get or create daily log
      let { data: dailyLog } = await this.supabaseService.client
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (!dailyLog) {
        this.logger.log(`Creating new daily log for user ${userId} on ${today}`);
        const { data: newLog, error: logError } = await this.supabaseService.client
          .from('daily_logs')
          .insert({
            user_id: userId,
            date: today,
            total_calories_consumed: 0,
            calories_burned: 0,
          })
          .select()
          .single();

        if (logError) throw logError;
        dailyLog = newLog;
      }

      // Insert food entry
      const { data, error } = await this.supabaseService.client
        .from('food_entries')
        .insert({
          user_id: userId,
          daily_log_id: dailyLog.id,
          description: foodEntry.description,
          calories: foodEntry.calories,
          protein: foodEntry.protein,
          carbs: foodEntry.carbs,
          fat: foodEntry.fat,
          fiber: foodEntry.fiber || 0,
          sugar: foodEntry.sugar || 0,
          sodium: foodEntry.sodium || 0,
          ai_model_used: foodEntry.ai_model_used,
        })
        .select()
        .single();

      if (error) throw error;

      this.logger.log(`Food entry created: ${data.id}`);
      return data;
    } catch (error) {
      this.logger.error(`Failed to save food entry: ${error.message}`);
      throw new Error('Failed to save food entry to database');
    }
  }

  async getUserFoodEntries(userId: string, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    this.logger.log(`Getting food entries for user ${userId} on ${targetDate}`);

    try {
      const { data, error } = await this.supabaseService.client
        .from('food_entries')
        .select(`
          *,
          daily_logs!inner(date)
        `)
        .eq('user_id', userId)
        .eq('daily_logs.date', targetDate)
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.logger.log(`Found ${data?.length || 0} food entries`);
      return data || [];
    } catch (error) {
      this.logger.error(`Failed to get food entries: ${error.message}`);
      throw new Error('Failed to retrieve food entries');
    }
  }

  async deleteFoodEntry(userId: string, entryId: string) {
    this.logger.log(`Deleting food entry ${entryId} for user ${userId}`);

    try {
      const { error } = await this.supabaseService.client
        .from('food_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) throw error;

      this.logger.log(`Food entry ${entryId} deleted successfully`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to delete food entry: ${error.message}`);
      throw new Error('Failed to delete food entry');
    }
  }
}