import { ApiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { GetDashboardSummaryResponse } from '../types/dashboard';

/**
 * Server-side wrapper — callers must supply a client from `getServerApiClient()`.
 */
export const DashboardApi = {
  getSummary(client: ApiClient) {
    return client.get<GetDashboardSummaryResponse>(API_ENDPOINTS.DASHBOARD.GET_SUMMARY);
  },
};
