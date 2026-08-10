/**
 * Server-Component data loaders for the employees routes. Kept apart from
 * `lib/actions/employees` — those are Server Functions the browser can call, these run only
 * as part of a server render.
 */

import { notFound, redirect } from 'next/navigation';
import { EmployeesApi } from '../api/employees';
import { getServerApiClient } from '../api/getServerApiClient';
import { NotFoundError, UnauthorizedError } from '../api/errors';
import { ROUTES } from '../../constants/strings';
import { logger } from '../logger';
import type { EmployeeDetail } from '../types/employees';

/**
 * Loads a single employee for the details and edit routes, so both screens arrive already
 * populated — no client-side loading pass, and no backend URL or access token reaches the
 * browser.
 *
 * @param employeeId - The employee's `id`, as taken from the route segment.
 * @returns The employee record.
 */
export async function getEmployeeDetail(employeeId: string): Promise<EmployeeDetail> {
  try {
    const client = getServerApiClient();
    const response = await EmployeesApi.getEmployee(client, employeeId);

    return response.data;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    if (error instanceof NotFoundError) {
      notFound();
    }

    logger.error('Error occurred while fetching employee:', error);

    throw error;
  }
}
