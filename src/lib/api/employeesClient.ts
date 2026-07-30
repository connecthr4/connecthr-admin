import type { GetEmployeeColumnsResponse } from '../types/employees';

/**
 * Browser-safe calls — same-origin requests to the Next.js Route Handler at
 * /api/employees/columns, which proxies to the backend. No auth header
 * needed: the first-party httpOnly session cookie rides along automatically.
 *
 * The employee list itself is fetched via the `getEmployees` Server Function
 * (`src/lib/actions/employees.ts`) instead of a Route Handler.
 */
export const EmployeesClient = {
  async getColumns(): Promise<GetEmployeeColumnsResponse> {
    const response = await fetch('/api/employees/columns');

    return handleResponse<GetEmployeeColumnsResponse>(response);
  },
};

async function handleResponse<T>(response: Response): Promise<T> {
  const payload = await response.json();

  if (!response.ok) {
    const error = new Error((payload as { message?: string })?.message ?? 'Request failed') as Error & {
      details?: unknown;
    };

    error.details = payload;

    throw error;
  }

  return payload as T;
}
