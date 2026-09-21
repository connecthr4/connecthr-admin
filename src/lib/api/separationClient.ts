import { getSeparationOptions } from '../actions/separation';
import type { DropdownOption } from '@/src/components/Dropdown/Dropdown';

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
