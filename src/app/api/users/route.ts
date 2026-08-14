import { NextResponse } from 'next/server';
import { getServerApiClient } from '@/src/lib/api/getServerApiClient';
import { UsersApi } from '@/src/lib/api/users';
import { getCurrentUser } from '@/src/lib/server/currentUser';
import { canManageUsers } from '@/src/lib/auth/roles';
import { forbiddenResponse, usersErrorResponse } from './errorResponse';
import type { CreateUserRequest } from '@/src/lib/types/users';

/**
 * Proxies the browser to the external backend using the first-party session
 * cookie — the browser never needs to know the backend's URL or hold a token.
 *
 * The role check here is repeated rather than assumed from the UI: a Route
 * Handler is a separate entry point, reachable by anyone who can reach the
 * app, so it cannot rely on the page guard having run. The backend enforces
 * the same rule again behind it.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!canManageUsers(user?.role)) {
      return forbiddenResponse();
    }

    const client = getServerApiClient();
    const response = await UsersApi.getUsers(client);

    return NextResponse.json(response);
  } catch (error) {
    return usersErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!canManageUsers(user?.role)) {
      return forbiddenResponse();
    }

    const body = (await request.json()) as CreateUserRequest;
    const client = getServerApiClient();
    const response = await UsersApi.createUser(client, body);

    return NextResponse.json(response);
  } catch (error) {
    return usersErrorResponse(error);
  }
}
