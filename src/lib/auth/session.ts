import 'server-only';
import { cookies } from 'next/headers';
import { ACCESS_TOKEN_COOKIE, REFRESH_CARRIER_COOKIE } from './cookies';

/**
 * The backend's own token expiry is the real security boundary here, so the
 * cookie lifetime just needs to comfortably outlive it between refreshes.
 */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: COOKIE_MAX_AGE,
};

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
    store.set(ACCESS_TOKEN_COOKIE, session.accessToken, cookieOptions);

    if (session.refreshCarrier) {
      store.set(REFRESH_CARRIER_COOKIE, session.refreshCarrier, cookieOptions);
    }
  });
}

export async function clearSession(): Promise<void> {
  await trySetCookies((store) => {
    store.delete(ACCESS_TOKEN_COOKIE);
    store.delete(REFRESH_CARRIER_COOKIE);
  });
}
