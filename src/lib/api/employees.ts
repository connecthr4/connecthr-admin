import { ApiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  ExportEmployeesRequest,
  GetEmployeeColumnsResponse,
  GetEmployeeResponse,
  GetEmployeesRequest,
  GetEmployeesResponse,
  UpdateEmployeeRequest,
  UpdateEmployeeResponse,
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

  getEmployee(client: ApiClient, employeeId: string) {
    return client.get<GetEmployeeResponse>(API_ENDPOINTS.EMPLOYEE.GET_BY_ID(employeeId));
  },

  getEmployees(client: ApiClient, data: GetEmployeesRequest) {
    return client.post<GetEmployeesResponse>(API_ENDPOINTS.EMPLOYEE.LIST, data);
  },

  createEmployee(client: ApiClient, data: CreateEmployeeRequest) {
    return client.post<CreateEmployeeResponse>(API_ENDPOINTS.EMPLOYEE.CREATE, data);
  },

  /**
   * A PATCH, so `data` only has to carry the sections and fields that changed.
   */
  updateEmployee(client: ApiClient, employeeId: string, data: UpdateEmployeeRequest) {
    return client.patch<UpdateEmployeeResponse>(API_ENDPOINTS.EMPLOYEE.UPDATE(employeeId), data);
  },

  /**
   * Answers with an Excel file, so the raw response is returned unread — the
   * route handler streams the body straight to the browser.
   */
  exportEmployees(client: ApiClient, data: ExportEmployeesRequest) {
    return client.postRaw(API_ENDPOINTS.EMPLOYEE.EXPORT, data);
  },

  getFilterOptions(client: ApiClient) {
    return client.get<GetFiltersResponse>(API_ENDPOINTS.COMMON.GET_FILTERS(FILTER_MODULE));
  },
};
