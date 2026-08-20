/**
 * Cookie names shared between the server-only session module and proxy.ts.
 * Kept dependency-free (no `server-only`, no `next/headers`) since proxy.ts
 * only needs to read the raw cookie name, not the session helpers.
 */
export const ACCESS_TOKEN_COOKIE = 'chr_access_token';
export const REFRESH_CARRIER_COOKIE = 'chr_refresh_carrier';

/**
 * The backend's own token expiry is the real security boundary here, so the
 * cookie lifetime just needs to comfortably outlive it between refreshes.
 */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * Shared by every writer of a session cookie — `session.ts` and `proxy.ts`
 * both set them, and two definitions that drifted on `path` would leave the
 * browser holding two cookies of the same name.
 *
 * These are persistent cookies: they carry a `maxAge`, so closing the browser
 * and reopening resumes the session rather than asking for a login. What still
 * bounds an unattended session is the idle timeout in `idle.ts` — reopening
 * after more than `IDLE_TIMEOUT_MINUTES` of inactivity lands on the login
 * screen, since the stored activity stamp is by then too old.
 */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: COOKIE_MAX_AGE,
};
