'use server';

import { redirect, RedirectType } from 'next/navigation';
import { apiConfig } from '../config/api';
import { API_ENDPOINTS } from '../api/endpoints';
import { getApiErrorInfo } from '../api/helpers';
import { getServerApiClient } from '../api/getServerApiClient';
import { buildCookieCarrier } from '../auth/cookieRelay';
import { clearSession, setSession } from '../auth/session';
import { expireIfIdle } from '../auth/idleGate';
import { LOGIN_SESSION_EXPIRED_URL, ROUTES } from '@/src/constants/strings';

import type { ChangePasswordRequest, ChangePasswordResponse, LoginRequest, LoginResponse, User } from '../types/auth';

type LoginActionResult = { success: true; user: User } | { success: false; message: string };

/**
 * Runs server-side so the session cookie can be set as httpOnly — a client
 * component can never do that itself. Returns rather than throws on
 * expected failures (bad credentials) per this fork's error-handling guide.
 */
export async function loginAction(credentials: LoginRequest): Promise<LoginActionResult> {
  try {
    const response = await fetch(`${apiConfig.baseUrl}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: apiConfig.headers,
      body: JSON.stringify(credentials),
    });

    const payload = await response.json();

    if (!response.ok) {
      return { success: false, message: (payload as { message?: string })?.message ?? 'Login failed' };
    }

    const { accessToken, user } = (payload as LoginResponse).data;
    const refreshCarrier = buildCookieCarrier(response.headers.getSetCookie());

    await setSession({ accessToken, refreshCarrier });

    return { success: true, user };
  } catch (error) {
    const { message } = getApiErrorInfo(error);

    return { success: false, message };
  }
}

type ChangePasswordActionResult = { success: true } | { success: false; message: string };

export async function changePasswordAction(data: ChangePasswordRequest): Promise<ChangePasswordActionResult> {
  /*
  `loginAction` above is deliberately not gated — there is no session to
  expire yet, and the login itself is what stamps the first activity time.
  */
  if (await expireIfIdle()) {
    redirect(LOGIN_SESSION_EXPIRED_URL, RedirectType.replace);
  }

  try {
    const client = getServerApiClient();

    await client.post<ChangePasswordResponse>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);

    return { success: true };
  } catch (error) {
    const { message } = getApiErrorInfo(error);

    return { success: false, message };
  }
}

/**
 * Ends the session everywhere it exists: the backend revokes the refresh
 * token, then both session cookies are dropped. `redirect` throws, so it
 * stays outside the try block per this fork's guide.
 */
export async function logoutAction(): Promise<void> {
  try {
    const client = getServerApiClient();

    await client.post(API_ENDPOINTS.AUTH.LOGOUT);
  } catch {
    // Best-effort — the session is cleared locally regardless.
  } finally {
    await clearSession();
  }

  /*
  Server Actions default to `push`, which would leave the signed-out app in
  the history stack — Back would land on a page the proxy has to bounce.
  Replacing the entry keeps the back button pointing outside the app.
  */
  redirect(ROUTES.LOGIN, RedirectType.replace);
}
