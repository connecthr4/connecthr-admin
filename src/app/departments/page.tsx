/**
 * @module app/departments/page
 */

import DepartmentsDashboard from '@/src/components/DepartmentsDashboard';

/**
 * A centralized dashboard to manage and view all company departments and their employee information.
 *
 * @remarks
 * This page is responsible for rendering the UI
 * for the `departments` route.
 *
 * @returns The page UI for the route.
 */
export default function DepartmentsPage() {
  return <DepartmentsDashboard />;
}
