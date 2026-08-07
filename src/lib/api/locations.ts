import { ApiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { GetDistrictsResponse, GetStatesResponse } from '../types/locations';

/**
 * Server-side wrapper — callers must supply a client from `getServerApiClient()`.
 */
export const LocationsApi = {
  getStates(client: ApiClient) {
    return client.get<GetStatesResponse>(API_ENDPOINTS.LOCATIONS.GET_STATES);
  },

  getDistricts(client: ApiClient, stateCode: string) {
    return client.get<GetDistrictsResponse>(API_ENDPOINTS.LOCATIONS.GET_DISTRICTS(stateCode));
  },
};
