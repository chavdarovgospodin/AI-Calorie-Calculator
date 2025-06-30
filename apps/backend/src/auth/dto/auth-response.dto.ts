import {
  ActivityLevel,
  Gender,
  Goal,
} from 'src/common/interfaces/user.interface';

export class AuthResponseDto {
  access_token: string;
  refresh_token: string; // Add this
  user: {
    id: string;
    email: string;
    age: number;
    gender: Gender;
    height: number;
    weight: number;
    goal: Goal;
    daily_calorie_goal: number;
    activity_level: ActivityLevel;
    created_at: Date;
    updated_at: Date;
  };
}
