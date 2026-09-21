'use server';

import { redirect } from 'next/navigation';
import { getServerApiClient } from '../api/getServerApiClient';
import { SeparationApi } from '../api/separation';
import { UnauthorizedError } from '../api/errors';
import { getApiErrorInfo } from '../api/helpers';
import { expireIfIdle } from '../auth/idleGate';
import { logger } from '../logger';
import { LOGIN_SESSION_EXPIRED_URL, ROUTES } from '../../constants/strings';
import type {
  GetSeparationOptionsResult,
  InitiateSeparationRequest,
  InitiateSeparationResult,
} from '../types/separation';

/**
 * Server Function — the separation types the form's dropdown offers.
 *
 * The form reads its list from here rather than declaring one, since
 * {@link initiateSeparation} rejects any code outside the set the backend serves. Callers go
 * through `SeparationOptionsClient`, which keeps the list for the life of the page.
 */
export async function getSeparationOptions(): Promise<GetSeparationOptionsResult> {
  /*
  Outside the try because `redirect` throws — this fork's guide again — and before the client
  is built because `getServerApiClient` refreshes on a 401, which would revive the session
  the gate just ended.
  */
  if (await expireIfIdle()) {
    redirect(LOGIN_SESSION_EXPIRED_URL);
  }

  try {
    const client = getServerApiClient();
    const response = await SeparationApi.getOptions(client);

    return { success: true, data: response.data };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    logger.error('Error occurred while fetching the separation options:', error);
    const { message } = getApiErrorInfo(error);

    return { success: false, message };
  }
}

/**
 * Server Function — files a separation, called straight from `SeparationForm` (a Client
 * Component) like a regular async function. Runs in a context where cookie mutation is
 * allowed (unlike a Server Component render), so a token refresh triggered here persists
 * normally.
 *
 * The message is passed straight back on both paths — the backend's own wording is what the
 * user is shown, rather than a copy of it kept in the UI that could drift from what was
 * actually recorded.
 */
export async function initiateSeparation(request: InitiateSeparationRequest): Promise<InitiateSeparationResult> {
  if (await expireIfIdle()) {
    redirect(LOGIN_SESSION_EXPIRED_URL);
  }

  try {
    const client = getServerApiClient();
    const response = await SeparationApi.initiateSeparation(client, request);

    return { success: true, message: response.message };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    logger.error('Error occurred while initiating the separation:', error);
    const { message } = getApiErrorInfo(error);

    return { success: false, message };
  }
}
