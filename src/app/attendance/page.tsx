/**
 * @module app/attendance/page
 */

import { redirect } from 'next/navigation';
import { ROUTES } from '@/src/constants/strings';

/**
 * The attendance segment has no screen of its own — the sidebar group only
 * ever links to the two routes below it. This exists so that typing `/attendance`
 * lands on the first of them instead of a 404.
 *
 * @returns Never — always redirects.
 */
export default function AttendancePage() {
  redirect(ROUTES.MARK_ATTENDANCE);
}
