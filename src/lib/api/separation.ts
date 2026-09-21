import { ApiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  GetSeparationOptionsResponse,
  InitiateSeparationRequest,
  InitiateSeparationResponse,
} from '../types/separation';

/**
 * Server-side wrapper — callers must supply a client from `getServerApiClient()`.
 */
export const SeparationApi = {
  /**
   * The separation types the form's dropdown offers.
   *
   * Short and effectively static, so it is read once per screen that offers it rather than
   * paged or searched — and read from the separation module's own endpoint, so the codes the
   * dropdown submits are the ones {@link initiateSeparation} accepts.
   */
  getOptions(client: ApiClient) {
    return client.get<GetSeparationOptionsResponse>(API_ENDPOINTS.SEPARATION.OPTIONS);
  },

  /**
   * Files a separation — the whole record in one request, which is what makes it atomic:
   * the backend either records the exit or rejects it, so a half-filed separation never has
   * to be reconciled from here.
   */
  initiateSeparation(client: ApiClient, data: InitiateSeparationRequest) {
    return client.post<InitiateSeparationResponse>(API_ENDPOINTS.SEPARATION.CREATE, data);
  },
};
