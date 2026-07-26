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
};
