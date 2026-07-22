/**
 * store responsible for managing user authentication, login state, access token, and session information.
 *
 */

import { create } from 'zustand';
import { AuthState } from './types';

const initialState = {
  accessToken: null,
  tempPassword: null,
  user: null,
};

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  login: (data) =>
    set({
      accessToken: data.accessToken,
      user: data.user,
    }),

  setTempPassword: (tempPassword) =>
    set({
      tempPassword,
    }),

  logout: () =>
    set({
      ...initialState,
    }),

  clearAuth: () =>
    set({
      ...initialState,
    }),

  setAccessToken: (accessToken) =>
    set({
      accessToken,
    }),

  setUser: (user) =>
    set({
      user,
    }),
}));
