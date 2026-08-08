/**
 * @module app/employees/[employeeId]
 */

import { notFound, redirect } from 'next/navigation';
import EmployeeDetails from '@/src/components/EmployeeDetails';
import { EmployeesApi } from '@/src/lib/api/employees';
import { getServerApiClient } from '@/src/lib/api/getServerApiClient';
import { NotFoundError, UnauthorizedError } from '@/src/lib/api/errors';
import { ROUTES } from '@/src/constants/strings';
import { logger } from '@/src/lib/logger';
import type { EmployeeDetail } from '@/src/lib/types/employees';

/**
 * Depends on the caller's session cookie, so it can never be statically
 * prerendered — always render this route per-request.
 */
export const dynamic = 'force-dynamic';

interface EmployeeDetailsPageProps {
  params: Promise<{ employeeId: string }>;
}

/**
 * Displays a single employee's personal, professional and payroll details.
 *
 * @remarks
 * This page is responsible for rendering the UI
 * for the `particular employee details` route. The record is fetched on the server so the
 * screen arrives already populated — no client-side loading pass, and no backend URL or
 * access token reaches the browser.
 *
 * @returns The page UI for the route.
 */
export default async function EmployeeDetailsPage({ params }: EmployeeDetailsPageProps) {
  const { employeeId } = await params;

  let employee: EmployeeDetail;

  try {
    const client = getServerApiClient();
    const response = await EmployeesApi.getEmployee(client, employeeId);
    employee = response.data;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }
    if (error instanceof NotFoundError) {
      notFound();
    }
    logger.error('Error fetching employee for EmployeeDetailsPage:', error);
    throw error;
  }

  return <EmployeeDetails employee={employee} />;
}
