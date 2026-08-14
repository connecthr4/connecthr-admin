/**
 * @module app/departments/page
 */

import DepartmentsDashboard from '@/src/components/DepartmentsDashboard';

/**
 * The surrounding layout resolves the signed-in user from the session cookie
 * to decide what the nav shows, so this route can never be statically
 * prerendered — always render it per-request.
 */
export const dynamic = 'force-dynamic';

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
