/**
 * @module app/employees/page
 */

import { redirect } from 'next/navigation';
import EmployeesDashboard from '@/src/components/EmployeesDashboard';
import { getServerApiClient } from '@/src/lib/api/getServerApiClient';
import { EmployeesApi } from '@/src/lib/api/employees';
import { UnauthorizedError } from '@/src/lib/api/errors';
import { ROUTES } from '@/src/constants/strings';
import type { Employee, EmployeeColumn, EmployeeListMeta } from '@/src/lib/types/employees';
import type { FilterOptions } from '@/src/lib/types/filters';
import { logger } from '@/src/lib/logger';

const DEFAULT_PAGE_SIZE = 10;

/**
 * Depends on the caller's session cookie, so it can never be statically
 * prerendered — always render this route per-request.
 */
export const dynamic = 'force-dynamic';

/**
 * Displays a centralized view of all employee records and management actions.
 *
 * @remarks
 * This page is responsible for rendering the UI
 * for the `employees` route.
 *
 * @returns The page UI for the route.
 */
export default async function EmployeesPage() {
  let initialColumns: EmployeeColumn[] = [];
  let initialEmployees: Employee[] = [];
  let initialMeta: EmployeeListMeta = {
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };
  let filterOptions: FilterOptions = [];

  try {
    const client = getServerApiClient();

    const [columnsResponse, filterOptionsResponse, employeesResponse] = await Promise.all([
      EmployeesApi.getColumns(client),
      EmployeesApi.getFilterOptions(client),
      EmployeesApi.getEmployees(client, {
        page: 1,
        limit: DEFAULT_PAGE_SIZE,
        sortBy: 'createdAt',
        sortOrder: 'asc',
      }),
    ]);

    initialColumns = columnsResponse?.data ?? [];
    initialEmployees = employeesResponse?.data ?? [];
    initialMeta = employeesResponse?.meta ?? initialMeta;
    filterOptions = filterOptionsResponse?.data ?? [];
  } catch (error) {
    logger.error('Error fetching initial data for EmployeesPage:', error);
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    throw error;
  }

  return (
    <EmployeesDashboard
      initialColumns={initialColumns}
      initialEmployees={initialEmployees}
      initialMeta={initialMeta}
      filterOptions={filterOptions}
    />
  );
}
