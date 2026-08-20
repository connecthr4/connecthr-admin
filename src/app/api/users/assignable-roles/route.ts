import { NextResponse } from 'next/server';
import { getServerApiClient } from '@/src/lib/api/getServerApiClient';
import { UsersApi } from '@/src/lib/api/users';
import { getCurrentUser } from '@/src/lib/server/currentUser';
import { withSession } from '@/src/lib/server/withSession';
import { canManageUsers } from '@/src/lib/auth/roles';
import { forbiddenResponse, usersErrorResponse } from '../errorResponse';

/**
 * Backs the create-user role dropdown. Fetched rather than derived in the
 * browser so the backend stays the source of truth on who may create whom —
 * and so `IT` is never offered, since the API rejects it for every caller.
 */
export const GET = withSession(async () => {
  try {
    const user = await getCurrentUser();

    if (!canManageUsers(user?.role)) {
      return forbiddenResponse();
    }

    const client = getServerApiClient();
    const response = await UsersApi.getAssignableRoles(client);

    return NextResponse.json(response);
  } catch (error) {
    return usersErrorResponse(error);
  }
});
