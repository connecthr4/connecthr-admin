import { NextResponse } from 'next/server';
import { ApiError } from '@/src/lib/api/errors';

/**
 * Shared by both location handlers so a failed lookup reaches the browser as the same
 * `{ success, message }` shape the rest of the API layer returns.
 */
export function locationsErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, message: error.message, details: error.details },
      { status: error.statusCode || 500 }
    );
  }

  return NextResponse.json({ success: false, message: 'Unexpected error' }, { status: 500 });
}
