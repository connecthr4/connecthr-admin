import 'server-only';
import { cookies } from 'next/headers';

const ACCESS_TOKEN_COOKIE = 'chr_access_token';
const REFRESH_CARRIER_COOKIE = 'chr_refresh_carrier';

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

export async function setSession(session: Session): Promise<void> {
  const store = await cookies();

  store.set(ACCESS_TOKEN_COOKIE, session.accessToken, cookieOptions);

  if (session.refreshCarrier) {
    store.set(REFRESH_CARRIER_COOKIE, session.refreshCarrier, cookieOptions);
  }
}

export async function clearSession(): Promise<void> {
  const store = await cookies();

  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_CARRIER_COOKIE);
}
