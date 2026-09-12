import { getServerApiClient } from '@/src/lib/api/getServerApiClient';
import { AttendanceApi } from '@/src/lib/api/attendance';
import { streamFileResponse } from '@/src/lib/api/fileResponse';
import { withSession } from '@/src/lib/server/withSession';
import { attendanceErrorResponse } from '../errorResponse';
import type { ExportAttendanceRequest } from '@/src/lib/types/attendance';

const FALLBACK_FILENAME = 'attendance.xlsx';

/**
 * Streams the backend's Excel export to the browser.
 *
 * A Route Handler rather than a Server Function, for the same reason the
 * employee export is one: a Server Function returns a serialized value, not a
 * streamable binary response. A POST because the criteria — the day, the
 * narrowing and the sort — travel in the body, exactly as they do for the
 * sheet itself.
 */
export const POST = withSession(async (request: Request) => {
  try {
    const body = (await request.json()) as ExportAttendanceRequest;
    const client = getServerApiClient();
    const upstream = await AttendanceApi.exportSheet(client, body);

    return streamFileResponse(upstream, FALLBACK_FILENAME);
  } catch (error) {
    return attendanceErrorResponse(error);
  }
});
