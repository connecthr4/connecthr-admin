/**
 * @module app/holidays/page
 */

import { redirect } from 'next/navigation';
import HolidaysDashboard from '@/src/components/HolidaysDashboard';
import { getServerApiClient } from '@/src/lib/api/getServerApiClient';
import { HolidaysApi } from '@/src/lib/api/holidays';
import { UnauthorizedError } from '@/src/lib/api/errors';
import { ROUTES } from '@/src/constants/strings';
import type { HolidayMonthGroup } from '@/src/lib/types/holidays';

/**
 * Depends on the caller's session cookie, so it can never be statically
 * prerendered — always render this route per-request.
 */
export const dynamic = 'force-dynamic';

/**
 * A module for managing and organizing company holiday schedules, including adding, updating, and viewing holidays.
 *
 * @remarks
 * This page is responsible for rendering the UI
 * for the `holidays` route.
 *
 * @returns The page UI for the route.
 */
export default async function HolidaysPage() {
  let initialHolidaysList: HolidayMonthGroup[] = [];

  try {
    const client = getServerApiClient();
    const response = await HolidaysApi.getHolidaysList(client);

    initialHolidaysList = response?.data ?? [];
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    throw error;
  }

  return <HolidaysDashboard initialHolidaysList={initialHolidaysList} />;
}
