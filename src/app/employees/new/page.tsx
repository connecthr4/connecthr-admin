/**
 * @module app/employees/new/page
 */

import EmployeeWizard from '@/src/components/EmployeeWizard';

/**
 * The surrounding layout resolves the signed-in user from the session cookie
 * to decide what the nav shows, so this route can never be statically
 * prerendered — always render it per-request.
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
export default function EmployeesNewPage() {
  return <EmployeeWizard mode="create" />;
}
