/**
 * Cookie names shared between the server-only session module and proxy.ts.
 * Kept dependency-free (no `server-only`, no `next/headers`) since proxy.ts
 * only needs to read the raw cookie name, not the session helpers.
 */
export const ACCESS_TOKEN_COOKIE = 'chr_access_token';
export const REFRESH_CARRIER_COOKIE = 'chr_refresh_carrier';
