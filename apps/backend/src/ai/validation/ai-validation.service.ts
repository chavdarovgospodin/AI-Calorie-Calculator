import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  reason?: string;
  suggestion?: string;
  detectedFoods?: string[];
}

@Injectable()
export class AiValidationService {
  private readonly logger = new Logger(AiValidationService.name);
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = configService.get<string>('GOOGLE_AI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Validates if text describes food consumption in context
   */
  async validateTextFood(description: string): Promise<ValidationResult> {
    this.logger.log(`🔍 Validating text for food content: "${description}"`);

    // Quick pre-validation filters
    const quickCheck = this.quickTextValidation(description);
    if (!quickCheck.isValid) {
      return quickCheck;
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });

      const prompt = `
Анализирай дали този текст описва КОНСУМАЦИЯ НА ХРАНА или нещо свързано с хранене.

Текст: "${description}"

ПРАВИЛА ЗА ВАЛИДАЦИЯ:
✅ ВАЛИДНИ примери:
- "ядох 1 ябълка"
- "пих кафе"
- "закусих с 2 филийки хляб" 
- "200г пилешко филе с ориз"
- "вечерях салата и риба"
- "изпих чаша мляко"
- "хапнах сандвич"
- "1 ябълка" (простo описание)
- "200г риба" (с количество)
- "кафе с мляко" (храна/напитка)

❌ НЕВАЛИДНИ примери:
- "здравей", "добро утро" 
- "колко е часът", "кога е"
- "как да отслабна"
- "дай ми рецепта"
- "кои са най-здравословните храни"
- "помощ", "info"
- "къде мога да купя"
- "препоръчай ми диета"

ФОКУС: Търси описания на храна (с глаголи за консумация ИЛИ прости описания на храни с количества)

Върни САМО JSON:
{
  "isFood": boolean,
  "confidence": number (0-100),
  "reason": "кратко обяснение",
  "suggestion": "съвет ако не е храна (optional)",
  "detectedFoods": ["храна1", "храна2"] (optional)
}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        this.logger.warn('AI returned invalid JSON for text validation');
        return this.fallbackTextValidation(description);
      }

      const aiResult = JSON.parse(jsonMatch[0]);

      return {
        isValid: aiResult.isFood,
        confidence: aiResult.confidence / 100,
        reason: aiResult.reason,
        suggestion: aiResult.suggestion,
        detectedFoods: aiResult.detectedFoods || [],
      };
    } catch (error) {
      this.logger.error(`Text validation failed: ${error.message}`);
      return this.fallbackTextValidation(description);
    }
  }

  /**
   * Validates if image contains food
   */
  async validateImageFood(imageBase64: string): Promise<ValidationResult> {
    this.logger.log(`📸 Validating image for food content`);

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });

      const prompt = `
Анализирай тази снимка и определи дали съдържа ХРАНА която може да се анализира за калории.

ПРАВИЛА ЗА ВАЛИДАЦИЯ:
✅ ВАЛИДНИ снимки:
- Чиния с ястие/храна
- Отделни храни (плодове, зеленчуци)
- Напитки в чаши/бутилки
- Сандвичи, закуски
- Готови ястия
- Пакетирани храни

❌ НЕВАЛИДНИ снимки:
- Хора, селфита
- Пейзажи, природа
- Животни, котки, кучета
- Предмети (маси, столове)
- Текст, документи
- Размазани/неясни снимки
- Ресторанти отвън (без храна)
- Кухни (без видима храна)

Върни САМО JSON:
{
  "isFood": boolean,
  "confidence": number (0-100),
  "reason": "какво виждаш на снимката",
  "suggestion": "съвет ако не е храна (optional)",
  "detectedFoods": ["храна1", "храна2"] (optional)
}
      `;

      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg',
        },
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        this.logger.warn('AI returned invalid JSON for image validation');
        return {
          isValid: false,
          confidence: 0.5,
          reason: 'Не мога да анализирам снимката правилно',
          suggestion: 'Моля направете по-ясна снимка на храна',
        };
      }

      const aiResult = JSON.parse(jsonMatch[0]);

      return {
        isValid: aiResult.isFood,
        confidence: aiResult.confidence / 100,
        reason: aiResult.reason,
        suggestion: aiResult.suggestion,
        detectedFoods: aiResult.detectedFoods || [],
      };
    } catch (error) {
      this.logger.error(`Image validation failed: ${error.message}`);
      return {
        isValid: false,
        confidence: 0.3,
        reason: 'Грешка при анализ на снимката',
        suggestion: 'Моля опитайте отново с ясна снимка на храна',
      };
    }
  }

  /**
   * Quick text validation using keywords and patterns
   */
  private quickTextValidation(text: string): ValidationResult {
    const lowerText = text.toLowerCase().trim();

    // Empty or too short
    if (lowerText.length < 2) {
      return {
        isValid: false,
        confidence: 0.9,
        reason: 'Твърде кратко описание',
        suggestion: 'Моля опишете какво сте яли, например: "ядох 1 ябълка"',
      };
    }

    // Common non-food patterns (more strict)
    const nonFoodPatterns = [
      /^(здравей|здрасти|хей|добър|лек|приятен)/,
      /^(колко|кога|къде|как|защо|кой|коя|кое)/,
      /^(помощ|help|info|информация)/,
      /^(дай\s+(ми|препоръка|съвет))/,
      /^(препоръчай|предложи|кажи\s+ми)/,
      /^(търся|искам\s+(да\s+знам|информация|помощ))/,
      /(часът|времето|днес|утре|вчера|седмица)/,
      /(рецепта|диета|план\s+за\s+хранене)/,
      /(къде\s+(мога|да\s+купя|има))/,
      /(най-добр|най-здравословн|най-подходящ)/,
    ];

    for (const pattern of nonFoodPatterns) {
      if (pattern.test(lowerText)) {
        return {
          isValid: false,
          confidence: 0.9,
          reason:
            'Това изглежда като въпрос или заявка, не описание на консумирана храна',
          suggestion:
            'Вместо това опишете какво сте яли: "ядох салата с домати" или "пих кафе"',
        };
      }
    }

    // Look for consumption verbs (Bulgarian)
    const consumptionVerbs = [
      'ядох',
      'изядох',
      'пих',
      'изпих',
      'консумирах',
      'закусих',
      'обядвах',
      'вечерях',
      'хапнах',
      'похапнах',
      'взех',
      'опитах',
      'вкусих',
      'изпих',
      'подхранвах',
    ];

    const hasConsumptionVerb = consumptionVerbs.some((verb) =>
      lowerText.includes(verb)
    );
    if (hasConsumptionVerb) {
      return { isValid: true, confidence: 0.9 };
    }

    // Common food keywords - allow simple food descriptions
    const foodKeywords = [
      'хляб',
      'месо',
      'риба',
      'пиле',
      'пилешко',
      'ориз',
      'картофи',
      'салата',
      'плод',
      'зеленчук',
      'кафе',
      'чай',
      'мляко',
      'сирене',
      'яйце',
      'паста',
      'супа',
      'торта',
      'бисквита',
      'шоколад',
      'ябълка',
      'банан',
      'домати',
      'краставици',
      'морков',
      'лук',
      'чушка',
      'спанак',
    ];

    const hasKeyword = foodKeywords.some((keyword) =>
      lowerText.includes(keyword)
    );

    // If has food keyword, check context
    if (hasKeyword) {
      // Check if it looks like a question about the food rather than consumption
      if (
        lowerText.includes('?') ||
        lowerText.startsWith('какво') ||
        lowerText.startsWith('кои')
      ) {
        return {
          isValid: false,
          confidence: 0.8,
          reason: 'Изглежда като въпрос за храна, не описание на консумация',
          suggestion:
            'Опишете конкретно какво сте яли: "ядох 200г ориз с пилешко"',
        };
      }

      // Allow simple food descriptions like "1 ябълка", "200г риба"
      if (
        /\d+\s*(г|грам|мл|ml|гр|бр|броя|чаши|чаша|филии|филия)/.test(
          lowerText
        ) ||
        /^\d+\s+[а-яё]+/.test(lowerText)
      ) {
        return { isValid: true, confidence: 0.9 }; // High confidence for clear food + quantity
      }

      return { isValid: true, confidence: 0.8 }; // Still high for food keywords
    }

    // Numbers + units could indicate food portions
    if (
      /\d+\s*(г|грам|мл|ml|гр|бр|броя|чаши|чаша|филии|филия)/.test(lowerText)
    ) {
      return { isValid: true, confidence: 0.85 }; // High confidence for units
    }

    // Simple patterns like "1 ябълка", "2 банана" - very clear food descriptions
    if (/^\d+\s+[а-яё]+/.test(lowerText)) {
      return { isValid: true, confidence: 0.9 }; // Very high confidence
    }

    // Default - require AI validation for edge cases
    return { isValid: true, confidence: 0.4 };
  }

  /**
   * Fallback validation when AI fails
   */
  private fallbackTextValidation(text: string): ValidationResult {
    const quickResult = this.quickTextValidation(text);
    if (!quickResult.isValid) {
      return quickResult;
    }

    // Conservative approach - allow but with low confidence
    return {
      isValid: true,
      confidence: 0.5,
      reason: 'Базова проверка - не можах да потвърдя със AI',
      suggestion:
        'За по-добри резултати опишете храната по-ясно с глагол: "ядох...", "пих..."',
    };
  }

  /**
   * Creates user-friendly error message
   */
  createValidationError(validation: ValidationResult): BadRequestException {
    const message = validation.reason || 'Невалиден вход за храна';
    const suggestion =
      validation.suggestion || 'Моля опитайте отново с описание на храна';

    return new BadRequestException({
      error: 'INVALID_FOOD_INPUT',
      message,
      suggestion,
      confidence: Math.round(validation.confidence * 100),
      detectedFoods: validation.detectedFoods || [],
    });
  }
}
