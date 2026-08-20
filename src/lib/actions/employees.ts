'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getServerApiClient } from '../api/getServerApiClient';
import { EmployeesApi } from '../api/employees';
import { UnauthorizedError } from '../api/errors';
import { getApiErrorInfo } from '../api/helpers';
import { expireIfIdle } from '../auth/idleGate';
import { logger } from '../logger';
import { LOGIN_SESSION_EXPIRED_URL, ROUTES } from '../../constants/strings';
import type {
  CreateEmployeeRequest,
  CreateEmployeeResult,
  GetEmployeesRequest,
  GetEmployeesResult,
  UpdateEmployeeRequest,
  UpdateEmployeeResult,
} from '../types/employees';

/**
 * Server Function — called directly from `EmployeesDashboard` (a Client
 * Component) like a regular async function. Runs in a context where cookie
 * mutation is allowed (unlike a Server Component render), so a token
 * refresh triggered here persists normally.
 */
export async function getEmployees(request: GetEmployeesRequest): Promise<GetEmployeesResult> {
  /*
  Outside the try because `redirect` throws — this fork's guide again — and
  before the client is built because `getServerApiClient` refreshes on a 401,
  which would revive the session the gate just ended.
  */
  if (await expireIfIdle()) {
    redirect(LOGIN_SESSION_EXPIRED_URL);
  }

  try {
    const client = getServerApiClient();
    const response = await EmployeesApi.getEmployees(client, request);

    return { success: true, data: response.data, meta: response.meta };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    logger.error('Error occurred while fetching employees:', error);
    const { message } = getApiErrorInfo(error);

    return { success: false, message };
  }
}

/**
 * Server Function — called from the wizard's final step. Going through a Server Function
 * rather than a Route Handler keeps this a single round trip with an end-to-end typed
 * payload, and no backend URL or token is ever exposed to the browser.
 */
export async function createEmployee(request: CreateEmployeeRequest): Promise<CreateEmployeeResult> {
  if (await expireIfIdle()) {
    redirect(LOGIN_SESSION_EXPIRED_URL);
  }

  try {
    const client = getServerApiClient();
    const response = await EmployeesApi.createEmployee(client, request);

    return { success: true, message: response.message, data: response.data };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    logger.error('Error occurred while creating employee:', error);
    const { message } = getApiErrorInfo(error);

    return { success: false, message };
  }
}

/**
 * Server Function — called from the wizard's final step in edit mode. `request` is a PATCH
 * body holding only the fields the user changed, so an untouched section is never sent.
 *
 * @param employeeId - The employee's `id`, the same value the edit route is keyed on.
 */
export async function updateEmployee(
  employeeId: string,
  request: UpdateEmployeeRequest
): Promise<UpdateEmployeeResult> {
  if (await expireIfIdle()) {
    redirect(LOGIN_SESSION_EXPIRED_URL);
  }

  try {
    const client = getServerApiClient();
    const response = await EmployeesApi.updateEmployee(client, employeeId, request);

    /*
      The details screen and the list are both server-rendered, so without this the user
      would be handed back to a cached render of the record they just changed.
    */
    revalidatePath(`${ROUTES.EMPLOYEES}/${employeeId}`);
    revalidatePath(ROUTES.EMPLOYEES);

    return { success: true, message: response.message, data: response.data };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    logger.error('Error occurred while updating employee:', error);
    const { message } = getApiErrorInfo(error);

    return { success: false, message };
  }
}
