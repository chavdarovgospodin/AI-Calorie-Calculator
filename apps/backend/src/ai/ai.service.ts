import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NutritionAnalysis } from './interfaces/nutrition-analysis.interface';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = configService.get<string>('GOOGLE_AI_API_KEY');
    
    if (!apiKey) {
      this.logger.error('Google AI API key is missing in environment variables');
      throw new Error('GOOGLE_AI_API_KEY is required');
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.logger.log('✅ Google AI service initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize Google AI service:', error);
      throw error;
    }
  }

  async analyzeTextFood(description: string): Promise<NutritionAnalysis> {
    const startTime = Date.now();
    this.logger.log(`🔍 Analyzing food text: "${description}"`);

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    Анализирай следното описание на храна и дай детайлна информация за хранителните стойности.
    Върни САМО JSON обект с точно тази структура (без markdown, без допълнителен текст):

    {
      "totalCalories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "fiber": number,
      "sugar": number,
      "sodium": number,
      "foods": [
        {
          "name": "име на храната",
          "quantity": "преценено количество",
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number
        }
      ]
    }

    Описание на храната: "${description}"

    Важни инструкции:
    - Ако количествата не са посочени, преценявай разумни порции
    - Всички стойности трябва да са числа (не strings)
    - Фибри в грамове, натрий в милиграми
    - За български храни използвай стандартни рецепти
    - Бъди максимално точен с хранителните стойности
    - Ако има няколко храни, анализирай всяка поотделно
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      this.logger.debug(`AI Response: ${text}`);
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const analysis: NutritionAnalysis = JSON.parse(jsonMatch[0]);
      
      // Validate the response structure
      this.validateNutritionAnalysis(analysis);
      
      const processingTime = Date.now() - startTime;
      this.logger.log(`✅ Food analysis completed: ${analysis.totalCalories} calories (${processingTime}ms)`);
      
      return analysis;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(`❌ Text food analysis failed after ${processingTime}ms: ${error.message}`);
      
      if (error.message.includes('JSON')) {
        throw new Error('AI returned invalid response format');
      }
      if (error.message.includes('API key')) {
        throw new Error('Invalid Google AI API key');
      }
      if (error.message.includes('quota')) {
        throw new Error('AI service quota exceeded');
      }
      
      throw new Error('Failed to analyze food description');
    }
  }

  async analyzeImageFood(imageBase64: string): Promise<NutritionAnalysis> {
    const startTime = Date.now();
    this.logger.log(`📸 Analyzing food image (${Math.round(imageBase64.length / 1024)}KB)`);

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    Анализирай тази снимка на храна и дай детайлна информация за хранителните стойности.
    Върни САМО JSON обект с точно тази структура (без markdown, без допълнителен текст):

    {
      "totalCalories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "fiber": number,
      "sugar": number,
      "sodium": number,
      "foods": [
        {
          "name": "име на храната",
          "quantity": "преценено количество",
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number
        }
      ]
    }

    Важни инструкции:
    - Преценявай размера на порциите въз основа на снимката
    - Всички стойности трябва да са числа (не strings)
    - Ако виждаш няколко храни, анализирай всяка поотделно
    - Бъди максимално точен с хранителните стойности
    - Фибри в грамове, натрий в милиграми
    - Ако не можеш да разпознаеш храната, каж това честно
    `;

    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg',
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();
      
      this.logger.debug(`AI Image Response: ${text}`);
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const analysis: NutritionAnalysis = JSON.parse(jsonMatch[0]);
      
      // Validate the response structure
      this.validateNutritionAnalysis(analysis);
      
      const processingTime = Date.now() - startTime;
      this.logger.log(`✅ Image analysis completed: ${analysis.totalCalories} calories (${processingTime}ms)`);
      
      return analysis;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(`❌ Image food analysis failed after ${processingTime}ms: ${error.message}`);
      
      if (error.message.includes('JSON')) {
        throw new Error('AI returned invalid response format');
      }
      if (error.message.includes('API key')) {
        throw new Error('Invalid Google AI API key');
      }
      if (error.message.includes('quota')) {
        throw new Error('AI service quota exceeded');
      }
      
      throw new Error('Failed to analyze food image');
    }
  }

  private validateNutritionAnalysis(analysis: any): void {
    const requiredFields = ['totalCalories', 'protein', 'carbs', 'fat', 'foods'];
    
    for (const field of requiredFields) {
      if (analysis[field] === undefined || analysis[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate numeric fields
    const numericFields = ['totalCalories', 'protein', 'carbs', 'fat'];
    for (const field of numericFields) {
      if (typeof analysis[field] !== 'number' || analysis[field] < 0) {
        throw new Error(`Invalid ${field}: must be a positive number`);
      }
    }

    // Validate foods array
    if (!Array.isArray(analysis.foods)) {
      throw new Error('Foods must be an array');
    }

    // Validate each food item
    analysis.foods.forEach((food: any, index: number) => {
      const requiredFoodFields = ['name', 'quantity', 'calories', 'protein', 'carbs', 'fat'];
      for (const field of requiredFoodFields) {
        if (food[field] === undefined || food[field] === null) {
          throw new Error(`Missing field ${field} in food item ${index}`);
        }
      }
    });

    this.logger.debug('✅ Nutrition analysis validation passed');
  }

  async testConnection(): Promise<boolean> {
    try {
      this.logger.log('Testing Google AI API connection...');
      
      const testAnalysis = await this.analyzeTextFood('1 ябълка');
      
      if (testAnalysis && testAnalysis.totalCalories > 0) {
        this.logger.log('✅ Google AI API connection test successful');
        return true;
      }
      
      return false;
    } catch (error) {
      this.logger.error('❌ Google AI API connection test failed:', error.message);
      return false;
    }
  }
}