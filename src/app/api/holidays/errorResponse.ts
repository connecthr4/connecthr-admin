import { NextResponse } from 'next/server';
import { ApiError } from '@/src/lib/api/errors';

/**
 * Shared by the holiday handlers so a failure reaches the browser as the same
 * `{ success, message }` shape the rest of the API layer returns — including
 * the export handler, whose success path is a binary stream rather than JSON.
 */
export function holidaysErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, message: error.message, details: error.details },
      { status: error.statusCode || 500 }
    );
  }

  return NextResponse.json({ success: false, message: 'Unexpected error' }, { status: 500 });
}
