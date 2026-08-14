import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { AuthApi } from '../api/auth';
import { getServerApiClient } from '../api/getServerApiClient';
import { UnauthorizedError } from '../api/errors';
import { canManageUsers } from '../auth/roles';
import { LOGIN_SESSION_EXPIRED_URL, ROUTES } from '../../constants/strings';
import { logger } from '../logger';
import type { User } from '../types/auth';

/**
 * Reads the signed-in user for the current server render.
 *
 * This is what replaces the client-side "bootstrap on mount" a token-in-memory
 * SPA needs: the access token here lives in an httpOnly cookie the browser
 * never sees, so a page reload never loses the session in the first place —
 * there is nothing to recover and no splash state to render. The user object
 * is simply fetched again as part of the server render and handed down as
 * props, which is also why the store is never persisted: `/auth/me` reads the
 * role straight from the database, so a demoted user cannot keep a stale one.
 *
 * `cache` memoizes the call for the duration of a single render pass, so the
 * layout and the page it wraps share one request rather than making two.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  try {
    const client = getServerApiClient();
    const response = await AuthApi.getMe(client);

    return response?.data ?? null;
  } catch (error) {
    if (!(error instanceof UnauthorizedError)) {
      /*
      A backend blip would otherwise take down every page that renders the
      nav. Failing closed costs the user a trip to the login screen; failing
      open would show a role-gated module to someone whose role is unknown.
      */
      logger.error('Error occurred while fetching the current user:', error);
    }

    return null;
  }
});

/**
 * For pages that need the user to exist. Sends anyone whose session could not
 * be resolved back to login, and anyone still carrying a temporary password to
 * the change-password screen before they can reach anything else — accounts
 * created through the admin UI always arrive in that state.
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();

  /*
  `redirect` throws, so it stays out of any try block. The marker on the URL
  tells `proxy.ts` not to bounce this back to the dashboard on the strength of
  a cookie this render could not clear.
  */
  if (!user) {
    redirect(LOGIN_SESSION_EXPIRED_URL);
  }

  if (user.mustChangePassword) {
    redirect(ROUTES.RESET_PASSWORD);
  }

  return user;
}

/**
 * The route guard for everything under user management. Hiding the nav item is
 * a courtesy so nobody clicks a button that will fail; this is what stops the
 * page rendering when the URL is typed in directly, which otherwise fires a
 * screenful of requests that all 403 and looks broken rather than forbidden.
 *
 * Still not the access control — the backend enforces the same rule on every
 * one of these routes and is reachable with curl regardless.
 */
export async function requireUserManagement(): Promise<User> {
  const user = await requireUser();

  if (!canManageUsers(user.role)) {
    redirect(ROUTES.DASHBOARD);
  }

  return user;
}
