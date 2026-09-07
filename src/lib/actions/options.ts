'use server';

import { redirect } from 'next/navigation';
import { getServerApiClient } from '../api/getServerApiClient';
import { OptionsApi } from '../api/options';
import { UnauthorizedError } from '../api/errors';
import { getApiErrorInfo } from '../api/helpers';
import { expireIfIdle } from '../auth/idleGate';
import { logger } from '../logger';
import { LOGIN_SESSION_EXPIRED_URL, ROUTES } from '../../constants/strings';
import { EMPLOYEE_OPTION_FIELDS, type EmployeeOptionField, type GetFieldOptionsResult } from '../types/options';

/**
 * Server Function — the values one employee field can be filled with, for the dropdowns
 * offering it: the wizard's Department, Gender and Marital Status all read their lists from
 * here rather than declaring them, since the create endpoint rejects anything outside the
 * set the backend serves.
 *
 * How a failure is handled is left to the caller: a filter that cannot be populated is a
 * narrowing the user loses, while a required field is a step they cannot complete.
 */
export async function getEmployeeOptions(field: EmployeeOptionField): Promise<GetFieldOptionsResult> {
  /*
  Outside the try because `redirect` throws — this fork's guide again — and before the client
  is built because `getServerApiClient` refreshes on a 401, which would revive the session
  the gate just ended.
  */
  if (await expireIfIdle()) {
    redirect(LOGIN_SESSION_EXPIRED_URL);
  }

  /*
    The argument arrives from the browser and goes into the request path, so an unknown field
    is refused here rather than forwarded to the backend.
  */
  if (!EMPLOYEE_OPTION_FIELDS.includes(field)) {
    logger.error('Rejected an unknown employee options field:', field);

    return { success: false, message: 'Unknown options field.' };
  }

  try {
    const client = getServerApiClient();
    const response = await OptionsApi.getEmployeeOptions(client, field);

    return { success: true, data: response.data };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    logger.error(`Error occurred while fetching the ${field} options:`, error);
    const { message } = getApiErrorInfo(error);

    return { success: false, message };
  }
}
