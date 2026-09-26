/**
 * @module app/employees/new/page
 */

import EmployeeWizard from '@/src/components/EmployeeWizard';
import { getCurrentUser } from '@/src/lib/server/currentUser';

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
export default async function EmployeesNewPage() {
  // Memoized for the render pass, so this shares the `/auth/me` request `BaseLayout` already made.
  const currentUser = await getCurrentUser();

  return <EmployeeWizard mode="create" currentUser={currentUser} />;
}
