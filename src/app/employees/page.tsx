/**
 * @module app/employees/page
 */

import EmployeesDashboard from '@/src/components/EmployeesDashboard';

/**
 * Displays a centralized view of all employee records and management actions.
 *
 * @remarks
 * This page is responsible for rendering the UI
 * for the `employees` route.
 *
 * @returns The page UI for the route.
 */
export default function EmployeesPage() {
  return <EmployeesDashboard />;
}
