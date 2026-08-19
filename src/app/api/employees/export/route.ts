import { getServerApiClient } from '@/src/lib/api/getServerApiClient';
import { EmployeesApi } from '@/src/lib/api/employees';
import { streamFileResponse } from '@/src/lib/api/fileResponse';
import { employeesErrorResponse } from '../errorResponse';
import type { ExportEmployeesRequest } from '@/src/lib/types/employees';

const FALLBACK_FILENAME = 'employees.xlsx';

/**
 * Streams the backend's Excel export to the browser. A POST rather than a GET
 * because the export criteria — search, filters, sort — travel in the body,
 * exactly as they do for the list itself.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExportEmployeesRequest;
    const client = getServerApiClient();
    const upstream = await EmployeesApi.exportEmployees(client, body);

    return streamFileResponse(upstream, FALLBACK_FILENAME);
  } catch (error) {
    return employeesErrorResponse(error);
  }
}
