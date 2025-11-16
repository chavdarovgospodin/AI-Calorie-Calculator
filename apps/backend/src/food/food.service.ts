import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { AiService } from '../ai/ai.service';
import { NutritionAnalysis } from '../ai/interfaces/nutrition-analysis.interface';
import { CreateFoodEntryDto } from './dto/food-entry.dto';
import { SaveFoodEntryDto } from './dto/save-food-entry.dto';

@Injectable()
export class FoodService {
  private readonly logger = new Logger(FoodService.name);

  constructor(
    private supabaseService: SupabaseService,
    private aiService: AiService
  ) {}

  async analyzeTextFood(
    userId: string,
    description: string
  ): Promise<NutritionAnalysis> {
    this.logger.log(`Analyzing text food for user ${userId}: ${description}`);

    try {
      const analysis: NutritionAnalysis =
        await this.aiService.analyzeTextFood(description);

      this.logger.log(
        `Analysis completed: ${analysis.totalCalories} calories, ${analysis.foods.length} foods`
      );
      return analysis;
    } catch (error) {
      this.logger.error(`Food analysis failed: ${error.message}`);
      throw new BadRequestException('Failed to analyze food description');
    }
  }

  async analyzeImageFood(
    userId: string,
    imageBase64: string
  ): Promise<NutritionAnalysis> {
    this.logger.log(`Analyzing food image for user ${userId}`);

    try {
      const analysis: NutritionAnalysis =
        await this.aiService.analyzeImageFood(imageBase64);

      this.logger.log(
        `Image analysis completed: ${analysis.totalCalories} calories`
      );
      return analysis;
    } catch (error) {
      this.logger.error(`Food image analysis failed: ${error.message}`);
      throw new BadRequestException('Failed to analyze food image');
    }
  }

  async saveFoodEntry(userId: string, foodEntry: SaveFoodEntryDto) {
    this.logger.log(`Saving food entry for user: ${userId}`);

    try {
      const today = new Date().toISOString().split('T')[0];

      // Get or create daily log
      let { data: dailyLog } = await this.supabaseService.client
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (!dailyLog) {
        this.logger.log(
          `Creating new daily log for user ${userId} on ${today}`
        );
        const { data: newLog, error: logError } =
          await this.supabaseService.client
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

      const foodEntries = [];

      if (foodEntry.foods && Array.isArray(foodEntry.foods)) {
        // Създай отделни записи за всяка храна
        for (const food of foodEntry.foods) {
          const entryDto: CreateFoodEntryDto = {
            description: food.name,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            ai_model_used: 'gemini-1.5-flash',
          };

          const savedEntry = await this.createFoodEntry(
            userId,
            dailyLog.id,
            entryDto,
            {
              food_name: food.name,
              quantity: this.parseQuantity(food.quantity),
              unit: this.extractUnit(food.quantity),
            }
          );
          foodEntries.push(savedEntry);
        }
      } else {
        // Създай един общ запис
        const entryDto: CreateFoodEntryDto = {
          description: foodEntry.description || 'Food entry',
          calories: foodEntry.totalCalories,
          protein: foodEntry.protein,
          carbs: foodEntry.carbs,
          fat: foodEntry.fat,
          ai_model_used: 'gemini-1.5-flash',
        };

        const savedEntry = await this.createFoodEntry(
          userId,
          dailyLog.id,
          entryDto,
          {
            food_name:
              this.extractMainFoodName(foodEntry.description) || 'Mixed Foods',
            quantity: 1,
            unit: 'serving',
          }
        );
        foodEntries.push(savedEntry);
      }

      this.logger.log(`Created ${foodEntries.length} food entries`);
      return {
        success: true,
        entries: foodEntries,
        totalCalories: foodEntry.totalCalories,
      };
    } catch (error) {
      this.logger.error(`Failed to save food entry: ${error.message}`);
      throw new BadRequestException('Failed to save food entry');
    }
  }

  // Стар метод от съществуващия код - запазваме за backward compatibility
  async saveFoodEntry_OLD(userId: string, foodEntry: CreateFoodEntryDto) {
    const today = foodEntry.date || new Date().toISOString().split('T')[0];

    try {
      let { data: dailyLog } = await this.supabaseService.client
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (!dailyLog) {
        this.logger.log(
          `Creating new daily log for user ${userId} on ${today}`
        );
        const { data: newLog, error: logError } =
          await this.supabaseService.client
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

      // Insert food entry (използва съществуващата структура)
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

  private async createFoodEntry(
    userId: string,
    dailyLogId: string,
    entryDto: CreateFoodEntryDto,
    extras?: { food_name?: string; quantity?: number; unit?: string }
  ) {
    const { data, error } = await this.supabaseService.client
      .from('food_entries')
      .insert({
        user_id: userId,
        daily_log_id: dailyLogId,
        description: entryDto.description,
        food_name: extras?.food_name || entryDto.description, // НОВО поле
        quantity: extras?.quantity || 1, // НОВО поле
        unit: extras?.unit || 'serving', // НОВО поле
        calories: entryDto.calories,
        protein: entryDto.protein,
        carbs: entryDto.carbs,
        fat: entryDto.fat,
        fiber: entryDto.fiber || 0,
        sugar: entryDto.sugar || 0,
        sodium: entryDto.sodium || 0,
        ai_model_used: entryDto.ai_model_used,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserFoodEntries(userId: string, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    this.logger.log(`Getting food entries for user ${userId} on ${targetDate}`);

    try {
      const { data, error } = await this.supabaseService.client
        .from('food_entries')
        .select(
          `
          id,
          food_name,
          description,
          quantity,
          unit,
          calories,
          protein,
          carbs,
          fat,
          created_at,
          daily_logs!inner(date)
        `
        )
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

  // Helper методи
  private parseQuantity(quantityString: string): number {
    if (!quantityString) return 1;

    const numberMatch = quantityString.match(/^(\d+(?:\.\d+)?)/);
    if (numberMatch && numberMatch[1]) {
      return parseFloat(numberMatch[1]);
    }

    return 1;
  }

  private extractUnit(quantityString: string): string {
    if (!quantityString) return 'serving';

    const unitMatches = quantityString.match(/\d+\s*([a-zA-Zа-я]+)/);
    if (unitMatches && unitMatches[1]) {
      const unit = unitMatches[1].toLowerCase();

      const unitMap: { [key: string]: string } = {
        г: 'g',
        гр: 'g',
        gram: 'g',
        grams: 'g',
        ml: 'ml',
        мл: 'ml',
        cup: 'cup',
        cups: 'cup',
        чаша: 'cup',
        бр: 'pcs',
        piece: 'pcs',
        pieces: 'pcs',
        slice: 'slice',
        slices: 'slice',
        филия: 'slice',
      };

      return unitMap[unit] || unit;
    }

    return 'serving';
  }

  private extractMainFoodName(description: string): string {
    if (!description) return 'Food';

    const words = description.split(/[,;]|and|и/i);
    const firstFood = words[0]?.trim();

    if (firstFood && firstFood.length > 0) {
      return firstFood.charAt(0).toUpperCase() + firstFood.slice(1);
    }

    return 'Mixed Foods';
  }
}
