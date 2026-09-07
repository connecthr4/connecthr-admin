import { ApiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { GetShiftsResponse } from '../types/shifts';

/**
 * Server-side wrapper — callers must supply a client from `getServerApiClient()`.
 */
export const ShiftsApi = {
  /**
   * The full shift list. Short and effectively static, so it is read once per
   * screen that offers it rather than being paged or searched.
   */
  getShifts(client: ApiClient) {
    return client.get<GetShiftsResponse>(API_ENDPOINTS.SHIFTS.GET_ALL);
  },
};
