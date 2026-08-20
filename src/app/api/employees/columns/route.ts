import { NextResponse } from 'next/server';
import { getServerApiClient } from '@/src/lib/api/getServerApiClient';
import { EmployeesApi } from '@/src/lib/api/employees';
import { withSession } from '@/src/lib/server/withSession';
import { employeesErrorResponse } from '../errorResponse';

/**
 * Proxies the browser to the external backend using the first-party session
 * cookie — the browser never needs to know the backend's URL or hold a token.
 */
export const GET = withSession(async () => {
  try {
    const client = getServerApiClient();
    const response = await EmployeesApi.getColumns(client);

    return NextResponse.json(response);
  } catch (error) {
    return employeesErrorResponse(error);
  }
});
