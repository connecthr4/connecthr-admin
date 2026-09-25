import { ApiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  DecideSeparationRequest,
  DecideSeparationResponse,
  GetSeparationOptionsResponse,
  GetSeparationResponse,
  GetSeparationsRequest,
  GetSeparationsResponse,
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

  /**
   * A page of filed separations.
   *
   * A GET with the paging in the query string, unlike the employee list's POST: this one is
   * scoped by nothing but a page number, so there is no body of criteria to carry.
   */
  getSeparations(client: ApiClient, data: GetSeparationsRequest) {
    return client.get<GetSeparationsResponse>(API_ENDPOINTS.SEPARATION.LIST, {
      query: { page: data.page, limit: data.limit },
    });
  },

  /**
   * One separation in full — the reason, the notes and the decision the list leaves out.
   */
  getSeparation(client: ApiClient, separationId: string) {
    return client.get<GetSeparationResponse>(API_ENDPOINTS.SEPARATION.GET_BY_ID(separationId));
  },

  /**
   * Grants a pending separation. `remarks` are optional here.
   */
  approveSeparation(client: ApiClient, separationId: string, data: DecideSeparationRequest = {}) {
    return client.patch<DecideSeparationResponse, DecideSeparationRequest>(
      API_ENDPOINTS.SEPARATION.APPROVE(separationId),
      data
    );
  },

  /**
   * Refuses a pending separation. `remarks` are mandatory, and the endpoint rejects a body
   * without them — a refusal should always say on what grounds.
   */
  rejectSeparation(client: ApiClient, separationId: string, data: DecideSeparationRequest) {
    return client.patch<DecideSeparationResponse, DecideSeparationRequest>(
      API_ENDPOINTS.SEPARATION.REJECT(separationId),
      data
    );
  },
};
