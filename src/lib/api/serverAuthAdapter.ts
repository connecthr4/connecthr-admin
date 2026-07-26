import 'server-only';
import { apiConfig } from '../config/api';
import { API_ENDPOINTS } from './endpoints';
import { buildCookieCarrier } from '../auth/cookieRelay';
import { clearSession, getSession, setSession } from '../auth/session';
import { UnauthorizedError } from './errors';

import type { ApiAuthAdapter } from './client';
import type { RefreshTokenResponse } from './types';

/**
 * Authenticates server-side requests (Server Components, Server Actions,
 * Route Handlers) using the first-party httpOnly session cookies. Refresh
 * cannot rely on the browser's automatic cookie handling here, since the
 * backend lives on a different origin than this Next.js server — the
 * refresh-token cookie the backend issued is manually relayed instead.
 */
export class ServerAuthAdapter implements ApiAuthAdapter {
  private refreshPromise: Promise<string> | null = null;

  async getAuthHeaderValue(): Promise<string | null> {
    const session = await getSession();

    return session ? `Bearer ${session.accessToken}` : null;
  }

  async refresh(): Promise<string> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.performRefresh().finally(() => {
        this.refreshPromise = null;
      });
    }

    return this.refreshPromise;
  }

  private async performRefresh(): Promise<string> {
    const session = await getSession();

    if (!session?.refreshCarrier) {
      await clearSession();

      throw new UnauthorizedError('No refresh token available');
    }

    const response = await fetch(`${apiConfig.baseUrl}${API_ENDPOINTS.AUTH.REFRESH}`, {
      method: 'POST',
      headers: {
        ...apiConfig.headers,
        Cookie: session.refreshCarrier,
      },
    });

    if (!response.ok) {
      await clearSession();

      throw new UnauthorizedError('Session expired');
    }

    const { data } = (await response.json()) as RefreshTokenResponse;

    const relayedCookies = response.headers.getSetCookie();
    const refreshCarrier = relayedCookies.length > 0 ? buildCookieCarrier(relayedCookies) : session.refreshCarrier;

    await setSession({ accessToken: data.accessToken, refreshCarrier });

    return data.accessToken;
  }
}
