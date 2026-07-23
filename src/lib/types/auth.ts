export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  status: string;
  mustChangePassword: boolean;
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
