import 'server-only';
import { cookies } from 'next/headers';
import { ACCESS_TOKEN_COOKIE } from './cookies';
import { isIdleExpired, LAST_ACTIVITY_COOKIE } from './idle';
import { revokeBackendSession } from './revoke';
import { clearSession, touchActivity } from './session';

/**
 * The idle-timeout gate, applied to every entry point that can reach the
 * backend: Route Handlers via `withSession`, Server Functions directly, and
 * page navigations via `proxy.ts`.
 *
 * Expiry is checked on use rather than on a client-side countdown, so an idle
 * user is stopped at the moment they try to do something rather than while
 * they are looking at the screen. It must run *before* any call through
 * `getServerApiClient()`, since that client refreshes on a 401 and would
 * otherwise revive a session this was about to end.
 *
 * Not itself the security boundary — the backend still authorizes every
 * request. This bounds how long an unattended browser stays usable.
 *
 * @returns `true` when the session had gone idle and has now been ended.
 */
export async function expireIfIdle(): Promise<boolean> {
  const store = await cookies();
  const accessToken = store.get(ACCESS_TOKEN_COOKIE)?.value;

  // Nothing to expire: unauthenticated callers are the login screen's problem.
  if (!accessToken) {
    return false;
  }

  if (isIdleExpired(store.get(LAST_ACTIVITY_COOKIE)?.value)) {
    await revokeBackendSession(accessToken);
    await clearSession();

    return true;
  }

  await touchActivity();

  return false;
}
