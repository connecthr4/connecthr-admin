/**
 * The single mirror of the backend's `ROLE_RANK`. Every permission question
 * in the app resolves through the helpers here — scattering role-name
 * comparisons across components is what lets the two drift apart.
 *
 * Deliberately free of `server-only` and `next/headers`: client components
 * (nav, forms) ask the same questions as the server render does.
 *
 * None of this is access control. The backend enforces every one of these
 * rules on its own and is reachable with curl regardless of what the browser
 * renders — these helpers only stop the UI offering an action that would 403.
 */

export const ROLES = {
  IT: 'IT',
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Mirror of the backend's ROLE_RANK. Note that IT outranks Super Admin
 * despite the name.
 */
const ROLE_RANK: Record<Role, number> = {
  [ROLES.IT]: 3,
  [ROLES.SUPER_ADMIN]: 2,
  [ROLES.ADMIN]: 1,
};

/**
 * Unknown or missing roles rank below every real one, so a role the frontend
 * has never heard of fails closed instead of being treated as privileged.
 */
function rankOf(role?: string | null): number {
  if (!role) {
    return 0;
  }

  return ROLE_RANK[role as Role] ?? 0;
}

/**
 * Whether the role may reach the routes under `/users` at all.
 *
 * The rule is strictly greater than the lowest tier: a role can never act on
 * its own tier, which is what prevents a lateral takeover.
 */
export function canManageUsers(role?: string | null): boolean {
  return rankOf(role) > ROLE_RANK[ROLES.ADMIN];
}

/**
 * Whether `actor` may create an account holding `target`. Used to sanity-check
 * a submitted role; the dropdown itself is driven by `assignable-roles` rather
 * than by this, so the backend stays the source of truth on who creates whom.
 */
export function canAssignRole(actor?: string | null, target?: string | null): boolean {
  return rankOf(actor) > rankOf(target) && rankOf(target) > 0;
}

/**
 * Human-readable labels for the role column and the create-user dropdown.
 * `IT` is included for display only — it is never offered as an option.
 */
export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.IT]: 'IT',
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Admin',
};

export function formatRole(role?: string | null): string {
  if (!role) {
    return '';
  }

  return ROLE_LABELS[role as Role] ?? role;
}
