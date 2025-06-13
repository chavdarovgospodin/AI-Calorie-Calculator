import { Module } from '@nestjs/common';
import { AiService } from './ai.service';

@Module({
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {
  constructor(private aiService: AiService) {
    // Test AI connection on module initialization
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