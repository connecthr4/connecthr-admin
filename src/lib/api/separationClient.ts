import { getSeparation, getSeparationOptions } from '../actions/separation';
import type { DropdownOption } from '@/src/components/Dropdown/Dropdown';
import type { SeparationDetail } from '../types/separation';

/**
 * Browser-safe access to the separation option lists, as a dropdown takes them.
 *
 * Like `EmployeeOptionsClient` this goes through a Server Function rather than a Route
 * Handler: nothing here needs a streamable response.
 *
 * The list is reference data that does not change while a page is open, and the drawer it
 * fills is opened once per employee the user acts on — so it is fetched at most once per
 * page load no matter how many times the panel is reopened. What is cached is the in-flight
 * promise, which also collapses concurrent callers into a single round trip. A failed lookup
 * is evicted so the next open can retry it.
 */
let separationOptionsRequest: Promise<DropdownOption[]> | null = null;

/**
 * @throws When the list cannot be read, so the caller can tell an empty list apart from a
 * failed lookup — a required field has to say something went wrong rather than silently
 * offer nothing.
 */
function loadSeparationTypes(): Promise<DropdownOption[]> {
  if (separationOptionsRequest) {
    return separationOptionsRequest;
  }

  separationOptionsRequest = getSeparationOptions()
    .then((result) => {
      if (!result.success) {
        throw new Error(result.message);
      }

      return result.data.separationTypes;
    })
    .catch((error) => {
      separationOptionsRequest = null;

      throw error;
    });

  return separationOptionsRequest;
}

export const SeparationOptionsClient = {
  getSeparationTypes: (): Promise<DropdownOption[]> => loadSeparationTypes(),
};

/**
 * One in-flight or settled read per separation id.
 *
 * The details drawer is opened, closed and reopened on the same rows as the user works down
 * a page, and a filed separation does not change underneath them while they do — so the
 * second open of a row costs nothing. Caching the *promise* rather than the record also
 * collapses a double-click into a single round trip.
 *
 * Keyed by separation id and never evicted on success: a page's worth of these is a few
 * dozen small records, and the map dies with the page. A failed read is evicted, so the
 * drawer's retry actually retries.
 */
const separationRequests = new Map<string, Promise<SeparationDetail>>();

/**
 * @throws When the separation cannot be read, carrying the backend's own wording, so the
 * drawer can show what went wrong and offer to try again.
 */
function loadSeparation(separationId: string): Promise<SeparationDetail> {
  const cached = separationRequests.get(separationId);

  if (cached) {
    return cached;
  }

  const request = getSeparation(separationId)
    .then((result) => {
      if (!result.success) {
        throw new Error(result.message);
      }

      return result.data;
    })
    .catch((error) => {
      separationRequests.delete(separationId);

      throw error;
    });

  separationRequests.set(separationId, request);

  return request;
}

export const SeparationsClient = {
  getSeparation: (separationId: string): Promise<SeparationDetail> => loadSeparation(separationId),

  /**
   * Drops a cached record, for when something has made it stale — a decision recorded from
   * this screen, once there is an endpoint for one. Nothing calls it yet.
   */
  invalidate: (separationId: string): void => {
    separationRequests.delete(separationId);
  },
};
