import { ApiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  CreateHolidayRequest,
  CreateHolidayResponse,
  DeleteHolidayRequest,
  DeleteHolidayResponse,
  GetHolidaysListResponse,
} from '../types/holidays';

/**
 * Server-side wrapper — callers must supply a client from `getServerApiClient()`.
 */
export const HolidaysApi = {
  getHolidaysList(client: ApiClient) {
    return client.get<GetHolidaysListResponse>(API_ENDPOINTS.HOLIDAYS.GET_HOLIDAYS_LIST);
  },

  createHoliday(client: ApiClient, data: CreateHolidayRequest) {
    return client.post<CreateHolidayResponse>(API_ENDPOINTS.HOLIDAYS.CREATE_HOLIDAY, data);
  },

  deleteHoliday(client: ApiClient, data: DeleteHolidayRequest) {
    return client.delete<DeleteHolidayResponse>(API_ENDPOINTS.HOLIDAYS.DELETE_HOLIDAY(data.id));
  },

  /**
   * Answers with an Excel file, so the raw response is returned unread — the
   * route handler streams the body straight to the browser.
   */
  exportHolidays(client: ApiClient) {
    return client.getRaw(API_ENDPOINTS.HOLIDAYS.EXPORT_HOLIDAYS);
  },
};
