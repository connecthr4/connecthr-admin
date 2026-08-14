import type { Role } from '../auth/roles';

/**
 * Account states the backend reports. Note that login does not currently
 * check status, so `DISABLED` does not yet lock anybody out — it is a label
 * on this screen, not an enforced state.
 */
export type UserStatus = 'ACTIVE' | 'LOCKED' | 'DISABLED';

/**
 * The account that created a row. Null for CLI-created accounts and for rows
 * that predate the column — rendered as a dash, never as "Unknown".
 */
export interface ManagedUserCreator {
  id: string;
  name: string;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  createdBy: ManagedUserCreator | null;
}

export interface GetUsersResponse {
  success: boolean;
  message: string;
  data: ManagedUser[];
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: Role;
}

export interface CreatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;

  /**
   * Returned exactly once, on creation, and never retrievable again.
   */
  temporaryPassword: string;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data: CreatedUser;
}

/**
 * Drives the create-user dropdown. `["SUPER_ADMIN", "ADMIN"]` for IT and
 * `["ADMIN"]` for a Super Admin — fetched rather than hardcoded so the
 * backend stays the source of truth on who may create whom.
 */
export interface GetAssignableRolesResponse {
  success: boolean;
  message: string;
  data: Role[];
}
