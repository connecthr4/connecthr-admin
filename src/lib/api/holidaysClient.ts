import { downloadFile } from './fileDownload';
import { handleSessionExpiry } from './sessionExpiry';
import type {
  CreateHolidayRequest,
  CreateHolidayResponse,
  DeleteHolidayRequest,
  DeleteHolidayResponse,
  GetHolidaysListResponse,
} from '../types/holidays';

/**
 * Used when the backend's `Content-Disposition` does not name the file.
 */
const FALLBACK_EXPORT_FILENAME = 'holidays.xlsx';

/**
 * Browser-safe calls — same-origin requests to the Next.js Route Handler at
 * /api/holidays, which proxies to the backend. No auth header needed: the
 * first-party httpOnly session cookie rides along automatically.
 */
export const HolidaysClient = {
  async getHolidaysList(): Promise<GetHolidaysListResponse> {
    const response = await fetch('/api/holidays');

    return handleResponse<GetHolidaysListResponse>(response);
  },

  async createHoliday(data: CreateHolidayRequest): Promise<CreateHolidayResponse> {
    const response = await fetch('/api/holidays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    return handleResponse<CreateHolidayResponse>(response);
  },

  async deleteHoliday(data: DeleteHolidayRequest): Promise<DeleteHolidayResponse> {
    const response = await fetch('/api/holidays', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    return handleResponse<DeleteHolidayResponse>(response);
  },

  /**
   * Downloads the holidays Excel export and hands it to the browser to save.
   */
  exportHolidays(): Promise<void> {
    return downloadFile('/api/holidays/export', FALLBACK_EXPORT_FILENAME);
  },
};

async function handleResponse<T>(response: Response): Promise<T> {
  const payload = await response.json();

  if (!response.ok) {
    handleSessionExpiry(response, payload);

    const error = new Error((payload as { message?: string })?.message ?? 'Request failed') as Error & {
      details?: unknown;
    };

    error.details = payload;

    throw error;
  }

  return payload as T;
}
