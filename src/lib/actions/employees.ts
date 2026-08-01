'use server';

import { redirect } from 'next/navigation';
import { getServerApiClient } from '../api/getServerApiClient';
import { EmployeesApi } from '../api/employees';
import { UnauthorizedError } from '../api/errors';
import { getApiErrorInfo } from '../api/helpers';
import { logger } from '../logger';
import { ROUTES } from '../../constants/strings';
import type { GetEmployeesRequest, GetEmployeesResult } from '../types/employees';

/**
 * Server Function — called directly from `EmployeesDashboard` (a Client
 * Component) like a regular async function. Runs in a context where cookie
 * mutation is allowed (unlike a Server Component render), so a token
 * refresh triggered here persists normally.
 */
export async function getEmployees(request: GetEmployeesRequest): Promise<GetEmployeesResult> {
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
