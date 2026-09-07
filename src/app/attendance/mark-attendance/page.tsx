/**
 * @module app/attendance/mark-attendance/page
 */

import MarkAttendanceDashboard from '@/src/components/MarkAttendanceDashboard';
import { getCurrentUser } from '@/src/lib/server/currentUser';
import { getServerApiClient } from '@/src/lib/api/getServerApiClient';
import { AttendanceApi } from '@/src/lib/api/attendance';
import { logger } from '@/src/lib/logger';
import { toDepartmentOptions, toShiftOptions } from '@/src/utils/attendance';
import type { DropdownOption } from '@/src/components/Dropdown/Dropdown';
import type { AttendanceStatusOption } from '@/src/lib/types/attendance';

/**
 * Depends on the caller's session cookie, so it can never be statically
 * prerendered — always render this route per-request.
 */
export const dynamic = 'force-dynamic';

/** The three option lists the screen's dropdowns are built from. */
interface MarkAttendanceOptions {
  statuses: AttendanceStatusOption[];
  shifts: DropdownOption[];
  departments: DropdownOption[];
}

/** Nothing to offer — what a failed read degrades to. See below. */
const NO_OPTIONS: MarkAttendanceOptions = { statuses: [], shifts: [], departments: [] };

/**
 * Reads every option the screen's dropdowns offer.
 *
 * One call for all three rather than a list per dropdown: they come from the
 * attendance module's own endpoint, so the values the filters send and the
 * statuses the sheet is marked with are the ones this backend accepts, and they
 * cannot drift apart between screens.
 *
 * Degrades to nothing rather than failing the render: the filters still offer
 * "All", which is the scope the screen opens on anyway, and the status dropdown
 * falls back to a built-in list — so an options outage costs the user a
 * narrowing rather than the whole screen.
 */
async function getMarkAttendanceOptions(): Promise<MarkAttendanceOptions> {
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

/**
 * The screen where an admin marks a day's attendance for the employees in a
 * department or shift.
 *
 * @remarks
 * This page is responsible for rendering the UI
 * for the `attendance/mark-attendance` route.
 *
 * @returns The page UI for the route.
 */
export default async function MarkAttendancePage() {
  const [currentUser, options] = await Promise.all([getCurrentUser(), getMarkAttendanceOptions()]);

  return (
    <MarkAttendanceDashboard
      currentUser={currentUser}
      departments={options.departments}
      shifts={options.shifts}
      statuses={options.statuses}
    />
  );
}
