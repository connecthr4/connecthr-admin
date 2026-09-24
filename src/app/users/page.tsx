/**
 * @module app/users/page
 */

import { redirect } from 'next/navigation';
import UsersDashboard from '@/src/components/UsersDashboard';
import { getServerApiClient } from '@/src/lib/api/getServerApiClient';
import { UsersApi } from '@/src/lib/api/users';
import { UnauthorizedError } from '@/src/lib/api/errors';
import { requireUserManagement } from '@/src/lib/server/currentUser';
import { logger } from '@/src/lib/logger';
import { ROUTES } from '@/src/constants/strings';
import type { Role } from '@/src/lib/auth/roles';
import type { ManagedUser } from '@/src/lib/types/users';

/**
 * Depends on the caller's session cookie, so it can never be statically
 * prerendered — always render this route per-request.
 */
export const dynamic = 'force-dynamic';

/**
 * Lists the admin accounts, for the roles entitled to manage them.
 *
 * @remarks
 * This page is responsible for rendering the UI
 * for the `users` route.
 *
 * The guard runs before anything is fetched, and in the page rather than the
 * layout: layouts don't re-render on client-side navigation, so a check there
 * would be skipped on a route change. Typing this URL in directly gets a
 * redirect, not a screen that renders and then fills with failed requests.
 *
 * The assignable roles are resolved here alongside the list rather than in the
 * browser, so the rows that offer a delete are settled on first paint instead
 * of the action appearing a moment after the table does.
 *
 * @returns The page UI for the route.
 */
export default async function UsersPage() {
  const currentUser = await requireUserManagement();

  let users: ManagedUser[] = [];
  let assignableRoles: Role[] = [];

  try {
    const client = getServerApiClient();

    /*
    In parallel: the roles decide which rows offer a delete action, so waiting
    for them in sequence would only delay the list they annotate.
    */
    const [usersResponse, rolesResponse] = await Promise.all([
      UsersApi.getUsers(client),

      /*
      Non-fatal, unlike the list itself. If this lookup fails the table still
      has everything it needs to render — it just offers no delete anywhere,
      which is the right way round to fail.
      */
      UsersApi.getAssignableRoles(client).catch((error) => {
        if (error instanceof UnauthorizedError) {
          throw error;
        }

        logger.error('Error occurred while fetching assignable roles:', error);

        return null;
      }),
    ]);

    users = usersResponse?.data ?? [];
    assignableRoles = rolesResponse?.data ?? [];
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    throw error;
  }

  return <UsersDashboard initialUsers={users} assignableRoles={assignableRoles} currentUser={currentUser} />;
}
