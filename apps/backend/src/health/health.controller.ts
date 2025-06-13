import { Controller, Get } from '@nestjs/common';
import { SupabaseService } from 'src/database/supabase.service';

@Controller('health')
export class HealthController {
  constructor(private supabaseService: SupabaseService) {}

  @Get()
  async check() {
    try {
      // Test database connection
      const dbHealthy = await this.supabaseService.testConnection();

      return {
        status: dbHealthy ? 'ok' : 'error',
        timestamp: new Date().toISOString(),
        service: 'calorie-tracker-backend',
        version: '1.0.0',
        database: dbHealthy ? 'connected' : 'disconnected',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'calorie-tracker-backend',
        version: '1.0.0',
        database: 'error',
        error: error.message,
      };
    }
  }

  @Get('db')
  async checkDatabase() {
    try {
      const isConnected = await this.supabaseService.testConnection();
      
      if (!isConnected) {
        return {
          status: 'error',
          error: 'Database connection failed',
          timestamp: new Date().toISOString(),
        };
      }

      const { count, error } = await this.supabaseService.client
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (error) {
        return {
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        status: 'ok',
        database: {
          connected: true,
          userCount: count || 0,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}