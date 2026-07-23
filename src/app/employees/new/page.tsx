/**
 * @module app/employees/new/page
 */

import EmployeeWizard from '@/src/components/EmployeeWizard';

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
