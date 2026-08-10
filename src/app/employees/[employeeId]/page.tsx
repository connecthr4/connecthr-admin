/**
 * @module app/employees/[employeeId]
 */

import EmployeeDetails from '@/src/components/EmployeeDetails';
import { getEmployeeDetail } from '@/src/lib/server/employees';

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
 * screen arrives already populated.
 *
 * @returns The page UI for the route.
 */
export default async function EmployeeDetailsPage({ params }: EmployeeDetailsPageProps) {
  const { employeeId } = await params;

  const employee = await getEmployeeDetail(employeeId);

  return <EmployeeDetails employee={employee} />;
}
