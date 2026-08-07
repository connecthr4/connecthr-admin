import { ApiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  GetEmployeeColumnsResponse,
  GetEmployeesRequest,
  GetEmployeesResponse,
} from '../types/employees';
import { GetFiltersResponse } from '../types/filters';

const FILTER_MODULE = 'employee';

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

  createEmployee(client: ApiClient, data: CreateEmployeeRequest) {
    return client.post<CreateEmployeeResponse>(API_ENDPOINTS.EMPLOYEE.CREATE, data);
  },

  getFilterOptions(client: ApiClient) {
    return client.get<GetFiltersResponse>(API_ENDPOINTS.COMMON.GET_FILTERS(FILTER_MODULE));
  },
};
