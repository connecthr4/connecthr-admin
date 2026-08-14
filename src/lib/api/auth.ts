import { ApiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { GetMeResponse } from '../types/auth';

/**
 * Server-side wrapper — callers must supply a client from `getServerApiClient()`.
 *
 * Login, logout and change-password live in `lib/actions/auth` instead: those
 * have to set or clear the session cookies, which only a Server Action can do.
 */
export const AuthApi = {
  getMe(client: ApiClient) {
    return client.get<GetMeResponse>(API_ENDPOINTS.AUTH.ME);
  },
};
