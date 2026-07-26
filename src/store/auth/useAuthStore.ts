/**
 * store responsible for managing user authentication, login state, access token, and session information.
 *
 */

import { create } from 'zustand';
import { AuthState } from './types';

const initialState = {
  tempPassword: null,
  user: null,
};

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  login: (data) =>
    set({
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

  setUser: (user) =>
    set({
      user,
    }),
}));
