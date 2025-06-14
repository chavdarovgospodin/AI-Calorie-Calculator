import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      this.logger.error('Supabase configuration missing');
      this.logger.error('Required: SUPABASE_URL and SUPABASE_SERVICE_KEY in .env file');
      throw new Error('Supabase URL and Service Key are required');
    }
    try {
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      this.logger.log('✅ Supabase client initialized successfully');
      this.logger.log(`Connected to: ${supabaseUrl}`);
    } catch (error) {
      this.logger.error('❌ Failed to initialize Supabase client:', error);
      throw error;
    }
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  async testConnection(): Promise<boolean> {
    try {
      this.logger.log('Testing Supabase connection...');

      const { data, error } = await this.supabase
        .from('users')
        .select('count', { count: 'exact', head: true });
      if (error) {
        this.logger.error('❌ Supabase connection test failed:', error.message);
        return false;
      }
      this.logger.log('✅ Supabase connection test successful');
      return true;
    } catch (error) {
      this.logger.error('❌ Supabase connection test error:', error.message);
      return false;
    }
  }

  async checkTablesExist(): Promise<boolean> {
    try {
      const requiredTables = ['users', 'daily_logs', 'food_entries', 'activity_entries'];
      for (const table of requiredTables) {
        const { error } = await this.supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        if (error) {
          this.logger.error(`❌ Table '${table}' not accessible:`, error.message);
          return false;
        }
      }
      this.logger.log('✅ All required tables are accessible');
      return true;
    } catch (error) {
      this.logger.error('❌ Tables check failed:', error.message);
      return false;
    }
  }
}
