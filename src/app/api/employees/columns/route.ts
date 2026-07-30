import { NextResponse } from 'next/server';
import { getServerApiClient } from '@/src/lib/api/getServerApiClient';
import { EmployeesApi } from '@/src/lib/api/employees';
import { ApiError } from '@/src/lib/api/errors';

/**
 * Proxies the browser to the external backend using the first-party session
 * cookie — the browser never needs to know the backend's URL or hold a token.
 */
export async function GET() {
  try {
    const client = getServerApiClient();
    const response = await EmployeesApi.getColumns(client);

    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}

function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, message: error.message, details: error.details },
      { status: error.statusCode || 500 }
    );
  }

  return NextResponse.json({ success: false, message: 'Unexpected error' }, { status: 500 });
}
