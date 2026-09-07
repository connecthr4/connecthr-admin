import { getEmployeeOptions } from '../actions/options';
import type { EmployeeOptionField } from '../types/options';
import type { DropdownOption } from '@/src/components/Dropdown/Dropdown';

/**
 * Browser-safe access to the employee option lists, as a dropdown takes them.
 *
 * Like `ShiftsClient` this goes through a Server Function rather than a Route Handler:
 * nothing here needs a streamable response.
 *
 * The lists are reference data that does not change while a page is open, so each one is
 * fetched at most once per page load. What is cached is the in-flight promise, which also
 * collapses concurrent callers into a single round trip. A failed lookup is evicted so it
 * can be retried.
 */
const optionsCache = new Map<EmployeeOptionField, Promise<DropdownOption[]>>();

/**
 * @throws When the list cannot be read, so the caller can tell an empty list apart from a
 * failed lookup — a required field has to say something went wrong rather than silently
 * offer nothing.
 */
function loadOptions(field: EmployeeOptionField): Promise<DropdownOption[]> {
  const cached = optionsCache.get(field);

  if (cached) {
    return cached;
  }

  const request = getEmployeeOptions(field)
    .then((result) => {
      if (!result.success) {
        throw new Error(result.message);
      }

      return result.data.options;
    })
    .catch((error) => {
      optionsCache.delete(field);

      throw error;
    });

  optionsCache.set(field, request);

  return request;
}

/**
 * One method per field rather than a single parameterised one: `DynamicForm` calls the
 * loader with the value of the field it depends on, so a loader it can hand an argument to
 * would take the wrong one.
 */
export const EmployeeOptionsClient = {
  getDepartmentOptions: (): Promise<DropdownOption[]> => loadOptions('department'),

  getGenderOptions: (): Promise<DropdownOption[]> => loadOptions('gender'),

  getMaritalStatusOptions: (): Promise<DropdownOption[]> => loadOptions('maritalStatus'),
};
