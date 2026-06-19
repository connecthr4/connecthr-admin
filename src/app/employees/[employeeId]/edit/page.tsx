/**
 * @module app/employees/[employeeId]
 */

import EmployeeWizard from '@/src/components/EmployeeWizard';

/**
 * Displays a centralized view of all employee records and management actions.
 *
 * @remarks
 * This page is responsible for rendering the UI
 * for the `particular employee details` route.
 *
 * @returns The page UI for the route.
 */
export default function EmployeeDetailsPage() {
  return <EmployeeWizard mode="edit" />;
}
