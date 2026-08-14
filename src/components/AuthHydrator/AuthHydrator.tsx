/**
 * Pushes the server-resolved user into the auth store on every full page load.
 *
 * A token-in-memory SPA has to recover its session on mount — set a bootstrap
 * flag, call the refresh endpoint, hydrate, then route — because a reload wipes
 * the token. Nothing here holds a token: it lives in an httpOnly cookie the
 * browser cannot read, so the session survives a reload on its own and the
 * server already knows who the user is by the time this renders. What a reload
 * *did* lose is the client store, which is why the user arrives as a prop from
 * the server render instead of from a second round trip. There is no splash
 * state because there is no window in which the answer is unknown.
 *
 * The store is deliberately never persisted to localStorage. The reason is not
 * the token — there isn't one to leak — but staleness: a user demoted from
 * Super Admin to Admin would keep seeing the user-management module from a
 * cached role. This re-reads the live role from `/auth/me` on every load.
 *
 * @example
 * ```tsx
 * <AuthHydrator user={user} />
 * ```
 */

'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/src/store/auth';

import type { User } from '@/src/lib/types/auth';

/**
 * Define the props available for the AuthHydrator component.
 */
interface AuthHydratorProps {
  /**
   * The user resolved during the server render, or null when no session could
   * be read.
   */
  user: User | null;
}

export default function AuthHydrator({ user }: AuthHydratorProps) {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  return null;
}
