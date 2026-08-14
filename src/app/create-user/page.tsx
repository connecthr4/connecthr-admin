/**
 * @module app/create-user/page
 */

import { redirect } from 'next/navigation';
import CreateUserDashboard from '@/src/components/CreateUserDashboard';
import { getServerApiClient } from '@/src/lib/api/getServerApiClient';
import { UsersApi } from '@/src/lib/api/users';
import { UnauthorizedError } from '@/src/lib/api/errors';
import { requireUserManagement } from '@/src/lib/server/currentUser';
import { ROUTES } from '@/src/constants/strings';
import type { Role } from '@/src/lib/auth/roles';

/**
 * Depends on the caller's session cookie, so it can never be statically
 * prerendered — always render this route per-request.
 */
export const dynamic = 'force-dynamic';

/**
 * Route used to create a new user of the application.
 *
 * @remarks
 * This page is responsible for rendering the UI
 * for the `create-user` route.
 *
 * The guard runs before anything is fetched, and in the page rather than the
 * layout: layouts don't re-render on client-side navigation, so a check there
 * would be skipped on a route change.
 *
 * The role options are resolved here rather than in the browser so the
 * dropdown is populated on first paint.
 *
 * @returns The page UI for the route.
 */
export default async function CreateUserPage() {
  const currentUser = await requireUserManagement();

  let assignableRoles: Role[] = [];

  try {
    const client = getServerApiClient();
    const response = await UsersApi.getAssignableRoles(client);

    assignableRoles = response?.data ?? [];
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    throw error;
  }

  return <CreateUserDashboard assignableRoles={assignableRoles} currentUser={currentUser} />;
}
