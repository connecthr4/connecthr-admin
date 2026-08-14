import { NextResponse } from 'next/server';
import { ApiError } from '@/src/lib/api/errors';

/**
 * Shared by the user handlers. Unlike the other modules' equivalents this one
 * relays `code` as well as `message`: the create-user form keys off
 * `USER_EMAIL_ALREADY_EXISTS` to attach the failure to the email field rather
 * than showing it as a generic banner.
 */
export function usersErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, message: error.message, code: error.code, details: error.details },
      { status: error.statusCode || 500 }
    );
  }

  return NextResponse.json({ success: false, message: 'Unexpected error' }, { status: 500 });
}

/**
 * Returned when the caller's own role cannot reach user management. The
 * backend returns the same 403 on its own — this only spares a pointless
 * round trip to it.
 */
export function forbiddenResponse() {
  return NextResponse.json({ success: false, message: 'Forbidden', code: 'INSUFFICIENT_PERMISSIONS' }, { status: 403 });
}
