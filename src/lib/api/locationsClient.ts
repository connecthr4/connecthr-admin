import { handleSessionExpiry } from './sessionExpiry';
import type { DropdownOption } from '@/src/components/Dropdown/Dropdown';
import type { DistrictLocation, GetDistrictsResponse, GetStatesResponse, StateLocation } from '../types/locations';

/**
 * Browser-safe calls — same-origin requests to the Next.js Route Handlers under
 * /api/locations, which proxy to the backend. No auth header needed: the first-party
 * httpOnly session cookie rides along automatically.
 *
 * States and districts are reference data that does not change while a page is open, so
 * every list is fetched at most once per page load. What gets cached is the in-flight
 * promise, which also collapses concurrent callers — the current and permanent address
 * dropdowns ask for the same lists — into a single round trip. A failed lookup is evicted
 * so it can be retried.
 */
const stateOptionsCache: { request: Promise<DropdownOption[]> | null } = { request: null };

const districtOptionsCache = new Map<string, Promise<DropdownOption[]>>();

/**
 * The districts endpoint is keyed on the state's `code`, so that is what the state dropdown
 * has to store.
 */
const toStateOptions = (states: StateLocation[]): DropdownOption[] =>
  states.map((state) => ({ label: state.name, value: state.code }));

/**
 * The employee record carries the district's `code`, so that is the value the dropdown
 * stores — the name is only what the user reads.
 */
const toDistrictOptions = (districts: DistrictLocation[]): DropdownOption[] =>
  districts.map((district) => ({ label: district.name, value: district.code }));

export const LocationsClient = {
  getStateOptions(): Promise<DropdownOption[]> {
    if (!stateOptionsCache.request) {
      stateOptionsCache.request = fetch('/api/locations/states')
        .then((response) => handleResponse<GetStatesResponse>(response))
        .then((payload) => toStateOptions(payload.data))
        .catch((error) => {
          stateOptionsCache.request = null;

          throw error;
        });
    }

    return stateOptionsCache.request;
  },

  getDistrictOptions(stateCode: string): Promise<DropdownOption[]> {
    const cached = districtOptionsCache.get(stateCode);

    if (cached) {
      return cached;
    }

    const request = fetch(`/api/locations/states/${encodeURIComponent(stateCode)}/districts`)
      .then((response) => handleResponse<GetDistrictsResponse>(response))
      .then((payload) => toDistrictOptions(payload.data))
      .catch((error) => {
        districtOptionsCache.delete(stateCode);

        throw error;
      });

    districtOptionsCache.set(stateCode, request);

    return request;
  },
};

async function handleResponse<T>(response: Response): Promise<T> {
  const payload = await response.json();

  if (!response.ok) {
    handleSessionExpiry(response, payload);

    const error = new Error((payload as { message?: string })?.message ?? 'Request failed') as Error & {
      details?: unknown;
    };

    error.details = payload;

    throw error;
  }

  return payload as T;
}
