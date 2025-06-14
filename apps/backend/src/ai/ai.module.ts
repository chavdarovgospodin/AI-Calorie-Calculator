import { Module } from '@nestjs/common';

import { AiService } from './ai.service';
import { AiValidationService } from './validation/ai-validation.service';

@Module({
  providers: [AiService, AiValidationService],
  exports: [AiService, AiValidationService],
})
export class AiModule {
  constructor(private aiService: AiService) {
    this.testAiConnection();
  }

  private async testAiConnection() {
    try {
      const isConnected = await this.aiService.testConnection();
      if (isConnected) {
        console.log('🤖 AI Module initialized successfully');
      } else {
        console.warn('⚠️ AI Module initialized but connection test failed');
      }
    } catch (error) {
      console.error('❌ AI Module initialization failed:', error.message);
    }
  }
}
