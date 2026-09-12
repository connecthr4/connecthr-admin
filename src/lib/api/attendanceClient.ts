import { downloadFile } from './fileDownload';
import type { ExportAttendanceRequest } from '../types/attendance';

/**
 * Used when the backend's `Content-Disposition` does not name the file.
 */
const FALLBACK_EXPORT_FILENAME = 'attendance.xlsx';

/**
 * Browser-safe calls — same-origin requests to the Next.js Route Handler at
 * /api/attendance/export, which proxies to the backend. No auth header needed:
 * the first-party httpOnly session cookie rides along automatically.
 *
 * Everything else the attendance screens read and write goes through the
 * Server Functions in `src/lib/actions/attendance.ts`. The export cannot follow
 * them: a Server Function returns a serialized value, not a streamable binary
 * response, so it goes through a Route Handler.
 */
export const AttendanceClient = {
  /**
   * Downloads a day's attendance Excel export and hands it to the browser to
   * save.
   */
  exportAttendance(data: ExportAttendanceRequest): Promise<void> {
    return downloadFile('/api/attendance/export', FALLBACK_EXPORT_FILENAME, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
};
