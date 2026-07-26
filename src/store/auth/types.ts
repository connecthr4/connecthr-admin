import { User } from '@/src/lib/types/auth';

export interface AuthState {
  tempPassword: string | null;
  user: User | null;

  login: (data: { user: User }) => void;
  logout: () => void;
  clearAuth: () => void;

  setTempPassword: (tempPassword: string | null) => void;
  setUser: (user: User | null) => void;
}
