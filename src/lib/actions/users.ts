'use server';

import { redirect } from 'next/navigation';
import { refresh } from 'next/cache';
import { getServerApiClient } from '../api/getServerApiClient';
import { UsersApi } from '../api/users';
import { UnauthorizedError } from '../api/errors';
import { getApiErrorInfo } from '../api/helpers';
import { expireIfIdle } from '../auth/idleGate';
import { canManageUsers } from '../auth/roles';
import { getCurrentUser } from '../server/currentUser';
import { logger } from '../logger';
import { LOGIN_SESSION_EXPIRED_URL, ROUTES, STRINGS } from '../../constants/strings';
import type { DeleteUserResult } from '../types/users';

/**
 * Server Function — deletes one admin account and hands the users page back
 * its new list in the same round trip.
 *
 * That last part is what `refresh()` buys. The obvious shape for this is a
 * DELETE through the Route Handler followed by a second call to re-read the
 * list, which is two round trips and leaves a window where the table still
 * shows the row that has gone. `refresh()` instead re-renders the route on the
 * server as part of *this* response, so the action's reply already carries the
 * re-fetched list. The page holds no copy of the rows in client state, so the
 * table simply re-renders with one fewer row and nothing has to be reconciled
 * by hand.
 *
 * `refresh()` rather than `revalidatePath()`: the users page is
 * `force-dynamic` and nothing about this list is cached, so there is no cache
 * entry to invalidate — and `revalidatePath` currently also forces every other
 * visited page to re-fetch on the next navigation, which this has no business
 * doing.
 *
 * @param userId - The account's `id`, as the list returns it.
 */
export async function deleteUser(userId: string): Promise<DeleteUserResult> {
  /*
  Outside the try because `redirect` throws, and before the client is built
  because `getServerApiClient` refreshes on a 401, which would revive the
  session the gate just ended.
  */
  if (await expireIfIdle()) {
    redirect(LOGIN_SESSION_EXPIRED_URL);
  }

  const currentUser = await getCurrentUser();

  /*
  A Server Function is a POST endpoint of its own, reachable without going
  anywhere near the table — so the rules the table renders are checked again
  here rather than assumed. The backend enforces all of them a third time and
  is the only one of the three that is actually load-bearing; the two rules
  repeated here are the ones this side can answer without another round trip.

  Rank is not among them: knowing whether the caller outranks the target means
  reading the target, which is a request the backend is about to make anyway.
  */
  if (!canManageUsers(currentUser?.role)) {
    return { success: false, message: STRINGS.USER_DELETION_NOT_PERMITTED };
  }

  if (currentUser?.id === userId) {
    return { success: false, message: STRINGS.CANNOT_DELETE_OWN_ACCOUNT };
  }

  try {
    const client = getServerApiClient();
    const response = await UsersApi.deleteUser(client, userId);

    refresh();

    return { success: true, message: response.message, data: response.data };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    logger.error('Error occurred while deleting user:', error);
    const { message } = getApiErrorInfo(error);

    return { success: false, message };
  }
}
