/**
 * @module app/separation/initiate-separation/page
 */

import InitiateSeparationForm from '@/src/components/InitiateSeparationForm';
import { getCurrentUser } from '@/src/lib/server/currentUser';
import { getSeparationEmployee } from '@/src/lib/server/separation';
import { SEPARATION_EMPLOYEE_QUERY } from '@/src/constants/strings';

/**
 * Depends on the caller's session cookie, so it can never be statically
 * prerendered — always render this route per-request.
 */
export const dynamic = 'force-dynamic';

interface InitiateSeparationPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * The screen where an admin starts an employee's exit.
 *
 * @remarks
 * This page is responsible for rendering the UI
 * for the `separation/initiate-separation` route.
 *
 * The employee is named by `?employeeId=`, which the separation action on the employee list
 * fills in, and is resolved here so the screen arrives knowing whose exit it is. Reaching
 * the route from the sidebar leaves it out, which is not an error: the form then asks for an
 * employee to be picked from the list first.
 *
 * @returns The page UI for the route.
 */
export default async function InitiateSeparationPage({ searchParams }: InitiateSeparationPageProps) {
  const params = await searchParams;
  const employeeIdParam = params[SEPARATION_EMPLOYEE_QUERY];

  // A repeated query parameter arrives as an array; the first one wins.
  const employeeId = Array.isArray(employeeIdParam) ? employeeIdParam[0] : employeeIdParam;

  const [currentUser, employee] = await Promise.all([
    getCurrentUser(),
    employeeId ? getSeparationEmployee(employeeId) : null,
  ]);

  return <InitiateSeparationForm employee={employee} currentUser={currentUser} />;
}
