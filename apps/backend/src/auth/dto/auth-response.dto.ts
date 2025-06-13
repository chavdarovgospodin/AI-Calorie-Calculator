export class AuthResponseDto {
  access_token: string;
  user: {
    id: string;
    email: string;
    age: number;
    gender: string;
    height: number;
    weight: number;
    goal: string;
    daily_calorie_goal: number;
    activity_level: string;
    created_at: string;
  };
}
