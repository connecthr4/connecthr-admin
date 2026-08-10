/**
 * @module app/employees/[employeeId]/edit
 */

import EmployeeWizard from '@/src/components/EmployeeWizard';
import { getEmployeeDetail } from '@/src/lib/server/employees';

/**
 * Depends on the caller's session cookie, so it can never be statically
 * prerendered — always render this route per-request.
 */
export const dynamic = 'force-dynamic';

interface EmployeeEditPageProps {
  params: Promise<{ employeeId: string }>;
}

/**
 * Displays the employee wizard seeded with an existing employee's record.
 *
 * @remarks
 * This page is responsible for rendering the UI
 * for the `edit employee` route. The record is fetched here rather than in the wizard, so
 * every step is already populated on its first render — the forms never flash empty, and
 * the browser makes no second round trip for data the server already had.
 *
 * @returns The page UI for the route.
 */
export default async function EmployeeEditPage({ params }: EmployeeEditPageProps) {
  const { employeeId } = await params;

  const employee = await getEmployeeDetail(employeeId);

  return <EmployeeWizard mode="edit" employee={employee} />;
}
