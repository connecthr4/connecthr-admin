/**
 * Server-Component data loaders for the attendance routes. Kept apart from
 * `lib/actions/attendance` — those are Server Functions the browser can call,
 * these run only as part of a server render.
 */

import { AttendanceApi } from '../api/attendance';
import { getServerApiClient } from '../api/getServerApiClient';
import { logger } from '../logger';
import { toDepartmentOptions, toShiftOptions } from '../../utils/attendance';

import type { DropdownOption } from '../../components/Dropdown/Dropdown';
import type { AttendanceStatusOption } from '../types/attendance';

/** The three option lists the module's dropdowns are built from. */
export interface AttendanceOptionLists {
  statuses: AttendanceStatusOption[];
  shifts: DropdownOption[];
  departments: DropdownOption[];
}

/** Nothing to offer — what a failed read degrades to. See below. */
const NO_OPTIONS: AttendanceOptionLists = { statuses: [], shifts: [], departments: [] };

/**
 * Reads every option the module's dropdowns offer.
 *
 * One call for all three rather than a list per dropdown, and one loader rather
 * than one per screen: they come from the attendance module's own endpoint, so
 * the values the filters send and the statuses a row is marked with are the
 * ones this backend accepts, and they cannot drift apart between the marking
 * sheet and the listing.
 *
 * Degrades to nothing rather than failing the render: the filters still offer
 * "All", which is the scope both screens open on anyway, and the status list
 * falls back to a built-in one — so an options outage costs the user a
 * narrowing rather than the whole screen.
 */
export async function getAttendanceOptions(): Promise<AttendanceOptionLists> {
  try {
    const client = getServerApiClient();
    const response = await AttendanceApi.getOptions(client);
    const { statuses = [], shifts = [], departments = [] } = response?.data ?? {};

    return {
      statuses,
      shifts: toShiftOptions(shifts),
      departments: toDepartmentOptions(departments),
    };
  } catch (error) {
    logger.error('Error occurred while fetching attendance options:', error);

    return NO_OPTIONS;
  }
}
