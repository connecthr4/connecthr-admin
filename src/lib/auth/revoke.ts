import { apiConfig } from '../config/api';
import { API_ENDPOINTS } from '../api/endpoints';
import { logger } from '../logger';

/**
 * A dead session should be revoked at the backend, not merely abandoned: once
 * the cookies are dropped, nothing else can ever present this token to log it
 * out, and the backend would keep honouring it until its own TTL ran down.
 *
 * Kept dependency-free (no `server-only`) because `proxy.ts` expires idle
 * navigations and needs this too.
 *
 * A deliberate raw `fetch` rather than `getServerApiClient()`: the API client
 * answers a 401 by refreshing, which would mint a brand-new token for the very
 * session being killed. The access token is still valid here, so a plain call
 * carrying it is all that is needed.
 *
 * @param accessToken - The still-valid token of the session being ended.
 */
export async function revokeBackendSession(accessToken: string): Promise<void> {
  try {
    await fetch(`${apiConfig.baseUrl}${API_ENDPOINTS.AUTH.LOGOUT}`, {
      method: 'POST',
      headers: {
        ...apiConfig.headers,
        Authorization: `Bearer ${accessToken}`,
      },
      /*
      The user is waiting on a redirect behind this call, so an unreachable
      backend must not hold up their trip to the login screen. Their session
      is cleared locally regardless.
      */
      signal: AbortSignal.timeout(3000),
    });
  } catch (error) {
    // Best-effort — see above.
    logger.error('Error occurred while revoking an idle session:', error);
  }
}
