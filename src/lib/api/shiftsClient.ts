import { getShifts } from '../actions/shifts';
import { toShiftOptions } from '@/src/utils/attendance';
import type { DropdownOption } from '@/src/components/Dropdown/Dropdown';

/**
 * Browser-safe access to the shift list, as a dropdown takes it.
 *
 * Unlike the other `*Client` modules this goes through the `getShifts` Server Function
 * rather than a Route Handler: nothing here needs a streamable response, and the shift list
 * already had a Server Function for the attendance screens to read it with.
 *
 * The shifts are reference data that does not change while a page is open, so they are
 * fetched at most once per page load. What is cached is the in-flight promise, which also
 * collapses concurrent callers into a single round trip. A failed lookup is evicted so it
 * can be retried.
 */
const shiftOptionsCache: { request: Promise<DropdownOption[]> | null } = { request: null };

export const ShiftsClient = {
  /**
   * @throws When the list cannot be read, so the caller can tell an empty list apart from a
   * failed lookup — a required field has to say something went wrong rather than silently
   * offer nothing.
   */
  getShiftOptions(): Promise<DropdownOption[]> {
    if (!shiftOptionsCache.request) {
      shiftOptionsCache.request = getShifts()
        .then((result) => {
          if (!result.success) {
            throw new Error(result.message);
          }

          return toShiftOptions(result.data);
        })
        .catch((error) => {
          shiftOptionsCache.request = null;

          throw error;
        });
    }

    return shiftOptionsCache.request;
  },
};
