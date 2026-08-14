/**
 * @module app/users/page
 */

import { redirect } from 'next/navigation';
import UsersDashboard from '@/src/components/UsersDashboard';
import { getServerApiClient } from '@/src/lib/api/getServerApiClient';
import { UsersApi } from '@/src/lib/api/users';
import { UnauthorizedError } from '@/src/lib/api/errors';
import { requireUserManagement } from '@/src/lib/server/currentUser';
import { ROUTES } from '@/src/constants/strings';
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
 * @returns The page UI for the route.
 */
export default async function UsersPage() {
  const currentUser = await requireUserManagement();

  let users: ManagedUser[] = [];

  try {
    const client = getServerApiClient();
    const response = await UsersApi.getUsers(client);

    users = response?.data ?? [];
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    throw error;
  }

  return <UsersDashboard initialUsers={users} currentUser={currentUser} />;
}
