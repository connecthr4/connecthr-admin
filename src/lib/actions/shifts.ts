'use server';

import { redirect } from 'next/navigation';
import { getServerApiClient } from '../api/getServerApiClient';
import { ShiftsApi } from '../api/shifts';
import { UnauthorizedError } from '../api/errors';
import { getApiErrorInfo } from '../api/helpers';
import { expireIfIdle } from '../auth/idleGate';
import { logger } from '../logger';
import { LOGIN_SESSION_EXPIRED_URL, ROUTES } from '../../constants/strings';
import type { GetShiftsResult } from '../types/shifts';

/**
 * Server Function — the shift list, for any screen that has to offer it as options: the
 * attendance filters narrow a day by it, and the employee wizard puts a joiner on one.
 *
 * Lives on its own rather than with the attendance actions because it is reference data
 * shared by both modules, not part of either one's flow.
 *
 * How a failure is handled is left to the caller: a filter that cannot be populated is a
 * narrowing the user loses, while a required field is a step they cannot complete.
 */
export async function getShifts(): Promise<GetShiftsResult> {
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
    const response = await ShiftsApi.getShifts(client);

    return { success: true, data: response.data };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    logger.error('Error occurred while fetching shifts:', error);
    const { message } = getApiErrorInfo(error);

    return { success: false, message };
  }
}
