import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ActivityLevel } from 'src/common/interfaces/user.interface';
import { calculateDailyCalories } from 'src/common/utils';
import { SupabaseService } from 'src/database/supabase.service';

import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private supabaseService: SupabaseService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log(`Attempting to register user: ${registerDto.email}`);

    try {
      // Check if user already exists
      const { data: existingUser } = await this.supabaseService.client
        .from('users')
        .select('email')
        .eq('email', registerDto.email)
        .single();
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
      // Register with Supabase Auth
      const { data: authData, error: authError } =
        await this.supabaseService.client.auth.signUp({
          email: registerDto.email,
          password: registerDto.password,
        });
      if (authError) {
        this.logger.error(`Supabase auth error: ${authError.message}`);
        throw new Error(`Registration failed: ${authError.message}`);
      }
      if (!authData.user) {
        throw new Error('User creation failed');
      }
      // Calculate daily calorie goal
      const dailyCalorieGoal = calculateDailyCalories(
        registerDto.age,
        registerDto.gender,
        registerDto.height,
        registerDto.weight,
        registerDto.goal,
        registerDto.activity_level || ActivityLevel.MODERATELY_ACTIVE
      );
      // Create user profile in our users table
      const { data: userData, error: userError } =
        await this.supabaseService.client
          .from('users')
          .insert({
            id: authData.user.id,
            email: registerDto.email,
            age: registerDto.age,
            gender: registerDto.gender,
            height: registerDto.height,
            weight: registerDto.weight,
            goal: registerDto.goal,
            daily_calorie_goal: dailyCalorieGoal,
            activity_level:
              registerDto.activity_level || ActivityLevel.MODERATELY_ACTIVE,
          })
          .select()
          .single();
      if (userError) {
        this.logger.error(`User profile creation error: ${userError.message}`);
        // Clean up auth user if profile creation fails
        await this.supabaseService.client.auth.admin.deleteUser(
          authData.user.id
        );
        throw new Error('Failed to create user profile');
      }
      // Generate JWT token
      const payload = { email: authData.user.email, sub: authData.user.id };
      const tokens = this.generateTokens(authData.user.id, authData.user.email);
      this.logger.log(`User registered successfully: ${registerDto.email}`);
      return {
        ...tokens,
        user: userData,
      };
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`);

      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error('Registration failed. Please try again.');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    this.logger.log(`Attempting to login user: ${loginDto.email}`);

    try {
      const { data: authData, error: authError } =
        await this.supabaseService.client.auth.signInWithPassword({
          email: loginDto.email,
          password: loginDto.password,
        });

      if (authError || !authData.user) {
        this.logger.warn(`Login failed for user: ${loginDto.email}`);
        throw new UnauthorizedException('Invalid email or password');
      }

      const { data: userData, error: userError } =
        await this.supabaseService.client
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

      if (userError || !userData) {
        this.logger.error(`User profile not found: ${authData.user.id}`);
        throw new UnauthorizedException('User profile not found');
      }

      const tokens = this.generateTokens(authData.user.id, authData.user.email);

      this.logger.log(`User logged in successfully: ${loginDto.email}`);

      return {
        ...tokens,
        user: userData,
      };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`);

      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(
        'Login failed. Please check your credentials.'
      );
    }
  }

  async refreshToken(
    refreshToken: string
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret:
          this.configService.get('JWT_REFRESH_SECRET') ||
          this.configService.get('JWT_SECRET') + '_refresh',
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const { data: user } = await this.supabaseService.client
        .from('users')
        .select('id, email')
        .eq('id', payload.sub)
        .single();

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user.id, user.email);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(userId: string, email: string) {
    const payload = { email, sub: userId };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: '15m', // Short-lived access token
    });

    const refresh_token = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      {
        expiresIn: '30d', // Long-lived refresh token
        secret:
          this.configService.get('JWT_REFRESH_SECRET') ||
          this.configService.get('JWT_SECRET') + '_refresh',
      }
    );

    return { access_token, refresh_token };
  }
}
