export interface Employee {
  id: string;
  avatar: string;
  name: string;
  employeeId: string;
  department: string;
  designation: string;
  type: string;
  status: string;
}

export interface EmployeeColumn {
  accessorKey: string;
  header: string;
}

export interface GetEmployeeColumnsResponse {
  success: boolean;
  message: string;
  data: EmployeeColumn[];
}

export interface EmployeeFilter {
  /**
   * The filter group's `id` from `/filters/employee`.
   */
  key: string;

  /**
   * Every selected option value for that group — the backend ORs them.
   */
  values: string[];
}

export type EmployeeSortOrder = 'asc' | 'desc';

export interface GetEmployeesRequest {
  page: number;
  limit: number;
  search?: string;
  filters?: EmployeeFilter[];
  sortBy?: string;
  sortOrder?: EmployeeSortOrder;
}

export interface EmployeeListMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetEmployeesResponse {
  success: boolean;
  message: string;
  data: Employee[];
  meta: EmployeeListMeta;
}

/**
 * Server Functions can't let custom error classes (e.g. `ApiError`) cross
 * the client/server boundary intact, so `getEmployees` reports failure
 * through this plain, serializable result instead of throwing.
 */
export type GetEmployeesResult =
  | { success: true; data: Employee[]; meta: EmployeeListMeta }
  | { success: false; message: string };
