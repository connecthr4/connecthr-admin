import { LoginResponse, User } from '@/src/lib/types/auth';

export interface AuthState {
  accessToken: string | null;
  user: User | null;

  login: (data: LoginResponse) => void;
  logout: () => void;
  clearAuth: () => void;

  setAccessToken: (accessToken: string | null) => void;
  setUser: (user: User | null) => void;
}
