import { getServerApiClient } from '@/src/lib/api/getServerApiClient';
import { HolidaysApi } from '@/src/lib/api/holidays';
import { streamFileResponse } from '@/src/lib/api/fileResponse';
import { holidaysErrorResponse } from '../errorResponse';

const FALLBACK_FILENAME = 'holidays.xlsx';

/**
 * Streams the backend's Excel export to the browser.
 */
export async function GET() {
  try {
    const client = getServerApiClient();
    const upstream = await HolidaysApi.exportHolidays(client);

    return streamFileResponse(upstream, FALLBACK_FILENAME);
  } catch (error) {
    return holidaysErrorResponse(error);
  }
}
