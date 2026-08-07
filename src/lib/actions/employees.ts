'use server';

import { redirect } from 'next/navigation';
import { getServerApiClient } from '../api/getServerApiClient';
import { EmployeesApi } from '../api/employees';
import { UnauthorizedError } from '../api/errors';
import { getApiErrorInfo } from '../api/helpers';
import { logger } from '../logger';
import { ROUTES } from '../../constants/strings';
import type {
  CreateEmployeeRequest,
  CreateEmployeeResult,
  GetEmployeesRequest,
  GetEmployeesResult,
} from '../types/employees';

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

/**
 * Server Function — called from the wizard's final step. Going through a Server Function
 * rather than a Route Handler keeps this a single round trip with an end-to-end typed
 * payload, and no backend URL or token is ever exposed to the browser.
 */
export async function createEmployee(request: CreateEmployeeRequest): Promise<CreateEmployeeResult> {
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
