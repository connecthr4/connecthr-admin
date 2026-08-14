import { ApiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  CreateUserRequest,
  CreateUserResponse,
  GetAssignableRolesResponse,
  GetUsersResponse,
} from '../types/users';

/**
 * Server-side wrapper — callers must supply a client from `getServerApiClient()`.
 *
 * Every route here requires a bearer token and a role above Admin. The
 * backend enforces that itself; the guards in the app only decide what to
 * render.
 */
export const UsersApi = {
  /**
   * Newest first, and unpaginated — the backend returns every account. Fine
   * at current volume, but this is the call to revisit before the list grows.
   */
  getUsers(client: ApiClient) {
    return client.get<GetUsersResponse>(API_ENDPOINTS.USERS.LIST);
  },

  /**
   * The response carries a generated password that is returned exactly once.
   */
  createUser(client: ApiClient, data: CreateUserRequest) {
    return client.post<CreateUserResponse>(API_ENDPOINTS.USERS.CREATE, data);
  },

  getAssignableRoles(client: ApiClient) {
    return client.get<GetAssignableRolesResponse>(API_ENDPOINTS.USERS.ASSIGNABLE_ROLES);
  },
};
