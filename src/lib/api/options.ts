import { ApiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { EmployeeOptionField, GetFieldOptionsResponse } from '../types/options';

/**
 * Server-side wrapper — callers must supply a client from `getServerApiClient()`.
 */
export const OptionsApi = {
  /**
   * The list one employee field can be filled from. Short and effectively static, so it is
   * read once per screen that offers it rather than being paged or searched.
   */
  getEmployeeOptions(client: ApiClient, field: EmployeeOptionField) {
    return client.get<GetFieldOptionsResponse>(API_ENDPOINTS.OPTIONS.GET_EMPLOYEE_OPTIONS(field));
  },
};
