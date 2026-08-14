import { describe, expect, it } from 'vitest';
import { canAssignRole, canManageUsers, formatRole, ROLES } from './roles';

describe('canManageUsers', () => {
  it('should allow IT', () => {
    expect(canManageUsers(ROLES.IT)).toBe(true);
  });

  it('should allow a Super Admin', () => {
    expect(canManageUsers(ROLES.SUPER_ADMIN)).toBe(true);
  });

  it('should refuse an Admin, who gets a 403 on every route under /users', () => {
    expect(canManageUsers(ROLES.ADMIN)).toBe(false);
  });

  it('should refuse an unresolved role rather than failing open', () => {
    expect(canManageUsers(undefined)).toBe(false);
    expect(canManageUsers(null)).toBe(false);
    expect(canManageUsers('')).toBe(false);
  });

  it('should refuse a role the frontend has never heard of', () => {
    expect(canManageUsers('OWNER')).toBe(false);
  });
});

describe('canAssignRole', () => {
  it('should let IT create a Super Admin and an Admin', () => {
    expect(canAssignRole(ROLES.IT, ROLES.SUPER_ADMIN)).toBe(true);
    expect(canAssignRole(ROLES.IT, ROLES.ADMIN)).toBe(true);
  });

  it('should let a Super Admin create only an Admin', () => {
    expect(canAssignRole(ROLES.SUPER_ADMIN, ROLES.ADMIN)).toBe(true);
    expect(canAssignRole(ROLES.SUPER_ADMIN, ROLES.SUPER_ADMIN)).toBe(false);
  });

  it('should refuse a peer, which is what prevents a lateral takeover', () => {
    expect(canAssignRole(ROLES.IT, ROLES.IT)).toBe(false);
    expect(canAssignRole(ROLES.ADMIN, ROLES.ADMIN)).toBe(false);
  });

  it('should refuse an Admin outright', () => {
    expect(canAssignRole(ROLES.ADMIN, ROLES.ADMIN)).toBe(false);
    expect(canAssignRole(ROLES.ADMIN, ROLES.SUPER_ADMIN)).toBe(false);
  });

  it('should never let anyone assign IT, since the API rejects it for every caller', () => {
    expect(canAssignRole(ROLES.SUPER_ADMIN, ROLES.IT)).toBe(false);
    expect(canAssignRole(ROLES.ADMIN, ROLES.IT)).toBe(false);
  });

  it('should refuse an unknown role on either side', () => {
    expect(canAssignRole('OWNER', ROLES.ADMIN)).toBe(false);
    expect(canAssignRole(ROLES.IT, 'OWNER')).toBe(false);
    expect(canAssignRole(ROLES.IT, undefined)).toBe(false);
  });
});

describe('formatRole', () => {
  it('should label the known roles', () => {
    expect(formatRole(ROLES.IT)).toBe('IT');
    expect(formatRole(ROLES.SUPER_ADMIN)).toBe('Super Admin');
    expect(formatRole(ROLES.ADMIN)).toBe('Admin');
  });

  it('should return an empty string when there is no role, so callers can pick a fallback', () => {
    expect(formatRole(undefined)).toBe('');
    expect(formatRole(null)).toBe('');
  });

  it('should pass an unrecognised role through rather than blanking it', () => {
    expect(formatRole('OWNER')).toBe('OWNER');
  });
});
