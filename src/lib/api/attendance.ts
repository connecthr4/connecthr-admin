import { ApiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  ExportAttendanceRequest,
  GetAttendanceOptionsResponse,
  GetAttendanceSheetRequest,
  GetAttendanceSheetResponse,
  MarkAttendanceRequest,
  SaveAttendanceDraftResponse,
  SubmitAttendanceResponse,
} from '../types/attendance';

/**
 * Server-side wrapper — callers must supply a client from `getServerApiClient()`.
 */
export const AttendanceApi = {
  /**
   * One page of a day's marking sheet, along with the day's head count.
   *
   * A POST because the sheet's criteria — the date, a search term and
   * repeatable department and shift filters — travel as a body, the same way
   * the employee list's do.
   */
  getSheet(client: ApiClient, data: GetAttendanceSheetRequest) {
    return client.post<GetAttendanceSheetResponse>(API_ENDPOINTS.ATTENDANCE.SHEET, data);
  },

  /**
   * The statuses, shifts and departments the module's dropdowns offer.
   *
   * Short and effectively static, so it is read once per screen that offers
   * them rather than paged or searched — and read from the attendance module's
   * own endpoint, so the values the dropdowns submit are the ones this backend
   * accepts.
   */
  getOptions(client: ApiClient) {
    return client.get<GetAttendanceOptionsResponse>(API_ENDPOINTS.ATTENDANCE.OPTIONS);
  },

  /**
   * Records a day's markings — the whole day in one request, since that is how
   * the sheet is marked and how the backend counts it.
   */
  submit(client: ApiClient, data: MarkAttendanceRequest) {
    return client.post<SubmitAttendanceResponse>(API_ENDPOINTS.ATTENDANCE.SUBMIT, data);
  },

  /**
   * Stores a day's markings as work in progress. Takes exactly what
   * {@link submit} does — the difference is what the backend does with it, not
   * what the sheet has to assemble.
   */
  saveDraft(client: ApiClient, data: MarkAttendanceRequest) {
    return client.post<SaveAttendanceDraftResponse>(API_ENDPOINTS.ATTENDANCE.DRAFT, data);
  },

  /**
   * Answers with an Excel file, so the raw response is returned unread — the
   * route handler streams the body straight to the browser.
   */
  exportSheet(client: ApiClient, data: ExportAttendanceRequest) {
    return client.postRaw(API_ENDPOINTS.ATTENDANCE.EXPORT, data);
  },
};
