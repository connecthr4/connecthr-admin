import { NextResponse } from 'next/server';
import { getServerApiClient } from '@/src/lib/api/getServerApiClient';
import { HolidaysApi } from '@/src/lib/api/holidays';
import { withSession } from '@/src/lib/server/withSession';
import { holidaysErrorResponse } from './errorResponse';
import type { CreateHolidayRequest, DeleteHolidayRequest } from '@/src/lib/types/holidays';

/**
 * Proxies the browser to the external backend using the first-party session
 * cookie — the browser never needs to know the backend's URL or hold a token.
 */
export const GET = withSession(async () => {
  try {
    const client = getServerApiClient();
    const response = await HolidaysApi.getHolidaysList(client);

    return NextResponse.json(response);
  } catch (error) {
    return holidaysErrorResponse(error);
  }
});

export const POST = withSession(async (request: Request) => {
  try {
    const body = (await request.json()) as CreateHolidayRequest;
    const client = getServerApiClient();
    const response = await HolidaysApi.createHoliday(client, body);

    return NextResponse.json(response);
  } catch (error) {
    return holidaysErrorResponse(error);
  }
});

export const DELETE = withSession(async (request: Request) => {
  try {
    const body = (await request.json()) as DeleteHolidayRequest;
    const client = getServerApiClient();
    const response = await HolidaysApi.deleteHoliday(client, body);

    return NextResponse.json(response);
  } catch (error) {
    return holidaysErrorResponse(error);
  }
});
