/**
 * @module app/holidays/page
 */

import HolidaysDashboard from '@/src/components/HolidaysDashboard';

/**
 * A module for managing and organizing company holiday schedules, including adding, updating, and viewing holidays.
 *
 * @remarks
 * This page is responsible for rendering the UI
 * for the `holidays` route.
 *
 * @returns The page UI for the route.
 */
export default function HolidaysPage() {
  return <HolidaysDashboard />;
}
