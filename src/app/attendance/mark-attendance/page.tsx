/**
 * @module app/attendance/mark-attendance/page
 */

import MarkAttendanceDashboard from '@/src/components/MarkAttendanceDashboard';
import { getCurrentUser } from '@/src/lib/server/currentUser';
import { getAttendanceOptions } from '@/src/lib/server/attendance';

/**
 * Depends on the caller's session cookie, so it can never be statically
 * prerendered — always render this route per-request.
 */
export const dynamic = 'force-dynamic';

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
  const [currentUser, options] = await Promise.all([getCurrentUser(), getAttendanceOptions()]);

  return (
    <MarkAttendanceDashboard
      currentUser={currentUser}
      departments={options.departments}
      shifts={options.shifts}
      statuses={options.statuses}
    />
  );
}
