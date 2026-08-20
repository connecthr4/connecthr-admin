import 'server-only';
import { cookies } from 'next/headers';
import { ACCESS_TOKEN_COOKIE, REFRESH_CARRIER_COOKIE, SESSION_COOKIE_OPTIONS } from './cookies';
import { LAST_ACTIVITY_COOKIE } from './idle';

export interface Session {
  accessToken: string;
  refreshCarrier: string;
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const accessToken = store.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  return {
    accessToken,
    refreshCarrier: store.get(REFRESH_CARRIER_COOKIE)?.value ?? '',
  };
}

/**
 * Next.js only allows cookie mutation inside a Server Action or Route
 * Handler; calling `.set()`/`.delete()` during a Server Component render
 * (e.g. a token refresh triggered by an SSR page's initial data fetch)
 * throws. That's a legitimate, expected context here — callers that need
 * the refreshed token for the current request read it from the auth
 * adapter's in-memory cache instead, and the next Route Handler-originated
 * request persists it for real. So failures here are swallowed.
 */
async function trySetCookies(mutate: (store: Awaited<ReturnType<typeof cookies>>) => void): Promise<void> {
  const store = await cookies();

  try {
    mutate(store);
  } catch {
    // Best-effort only — see comment above.
  }
}

export async function setSession(session: Session): Promise<void> {
  await trySetCookies((store) => {
    store.set(ACCESS_TOKEN_COOKIE, session.accessToken, SESSION_COOKIE_OPTIONS);
    store.set(LAST_ACTIVITY_COOKIE, String(Date.now()), SESSION_COOKIE_OPTIONS);

    if (session.refreshCarrier) {
      store.set(REFRESH_CARRIER_COOKIE, session.refreshCarrier, SESSION_COOKIE_OPTIONS);
    }
  });
}

/**
 * Slides the idle window forward. Separate from `setSession` because most
 * activity — a navigation, a list refresh — does not rotate the token.
 */
export async function touchActivity(): Promise<void> {
  await trySetCookies((store) => {
    store.set(LAST_ACTIVITY_COOKIE, String(Date.now()), SESSION_COOKIE_OPTIONS);
  });
}

export async function clearSession(): Promise<void> {
  await trySetCookies((store) => {
    store.delete(ACCESS_TOKEN_COOKIE);
    store.delete(REFRESH_CARRIER_COOKIE);
    store.delete(LAST_ACTIVITY_COOKIE);
  });
}
