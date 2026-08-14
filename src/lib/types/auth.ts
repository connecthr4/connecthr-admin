import type { Role } from '../auth/roles';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: Role;
  status: string;
  mustChangePassword: boolean;
}

/**
 * `/auth/me` returns the same user shape as login and refresh, read straight
 * from the database — so it reflects a role change made since the current
 * access token was issued, without forcing a token rotation.
 */
export interface GetMeResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface LoginData {
  accessToken: string;
  user: User;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginData;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}
