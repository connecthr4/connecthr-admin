import { NextResponse } from 'next/server';
import { getServerApiClient } from '@/src/lib/api/getServerApiClient';
import { LocationsApi } from '@/src/lib/api/locations';
import { locationsErrorResponse } from '../errorResponse';

/**
 * Proxies the browser to the external backend using the first-party session cookie — the
 * browser never needs to know the backend's URL or hold a token.
 */
export async function GET() {
  try {
    const client = getServerApiClient();
    const response = await LocationsApi.getStates(client);

    return NextResponse.json(response);
  } catch (error) {
    return locationsErrorResponse(error);
  }
}
