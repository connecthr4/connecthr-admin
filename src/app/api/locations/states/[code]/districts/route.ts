import { NextResponse } from 'next/server';
import { getServerApiClient } from '@/src/lib/api/getServerApiClient';
import { LocationsApi } from '@/src/lib/api/locations';
import { withSession } from '@/src/lib/server/withSession';
import { locationsErrorResponse } from '../../../errorResponse';

/**
 * Proxies the browser to the external backend using the first-party session cookie — the
 * browser never needs to know the backend's URL or hold a token.
 */
export const GET = withSession(async (_request: Request, { params }: { params: Promise<{ code: string }> }) => {
  try {
    const { code } = await params;

    const client = getServerApiClient();
    const response = await LocationsApi.getDistricts(client, code);

    return NextResponse.json(response);
  } catch (error) {
    return locationsErrorResponse(error);
  }
});
