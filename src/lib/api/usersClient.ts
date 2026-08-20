import { handleSessionExpiry } from './sessionExpiry';
import type {
  CreateUserRequest,
  CreateUserResponse,
  GetAssignableRolesResponse,
  GetUsersResponse,
} from '../types/users';

/**
 * Browser-safe calls — same-origin requests to the Next.js Route Handlers
 * under /api/users, which proxy to the backend. No auth header needed: the
 * first-party httpOnly session cookie rides along automatically.
 */
export const UsersClient = {
  async getUsers(): Promise<GetUsersResponse> {
    const response = await fetch('/api/users');

    return handleResponse<GetUsersResponse>(response);
  },

  async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    return handleResponse<CreateUserResponse>(response);
  },

  async getAssignableRoles(): Promise<GetAssignableRolesResponse> {
    const response = await fetch('/api/users/assignable-roles');

    return handleResponse<GetAssignableRolesResponse>(response);
  },
};

/**
 * The API error `code` is carried on the thrown error as well as the message —
 * the create-user form routes `USER_EMAIL_ALREADY_EXISTS` to the email field
 * and `ACCOUNT_NOT_ACTIVE` to a forced logout, which the message alone can't
 * distinguish reliably.
 */
export interface UsersClientError extends Error {
  code?: string;
  details?: unknown;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const payload = await response.json();

  if (!response.ok) {
    handleSessionExpiry(response, payload);

    const error = new Error((payload as { message?: string })?.message ?? 'Request failed') as UsersClientError;

    error.code = (payload as { code?: string })?.code;
    error.details = payload;

    throw error;
  }

  return payload as T;
}
