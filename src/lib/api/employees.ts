import { ApiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { GetEmployeeColumnsResponse, GetEmployeesRequest, GetEmployeesResponse } from '../types/employees';

/**
 * Server-side wrapper — callers must supply a client from `getServerApiClient()`.
 */
export const EmployeesApi = {
  getColumns(client: ApiClient) {
    return client.get<GetEmployeeColumnsResponse>(API_ENDPOINTS.EMPLOYEE.GET_COLUMNS);
  },

  getEmployees(client: ApiClient, data: GetEmployeesRequest) {
    return client.post<GetEmployeesResponse>(API_ENDPOINTS.EMPLOYEE.LIST, data);
  },
};
