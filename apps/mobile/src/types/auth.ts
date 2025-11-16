export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: import('./user').User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
