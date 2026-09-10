/**
 * @module app/attendance/attendance-list/page
 */

import AttendanceListDashboard from '@/src/components/AttendanceListDashboard';
import { getCurrentUser } from '@/src/lib/server/currentUser';
import { getAttendanceOptions } from '@/src/lib/server/attendance';

/**
 * Depends on the caller's session cookie, so it can never be statically
 * prerendered — always render this route per-request.
 */
export const dynamic = 'force-dynamic';

/**
 * The read-only view of what has already been marked: a day's attendance and
 * overtime records.
 *
 * @remarks
 * This page is responsible for rendering the UI
 * for the `attendance/attendance-list` route.
 *
 * @returns The page UI for the route.
 */
export default async function AttendanceListPage() {
  const [currentUser, options] = await Promise.all([getCurrentUser(), getAttendanceOptions()]);

  return (
    <AttendanceListDashboard currentUser={currentUser} departments={options.departments} statuses={options.statuses} />
  );
}
