/**
 * @module app/dashboard/page
 */

import { redirect } from 'next/navigation';
import Dashboard from '@/src/components/Dashboard';
import { getServerApiClient } from '@/src/lib/api/getServerApiClient';
import { DashboardApi } from '@/src/lib/api/dashboard';
import { UnauthorizedError } from '@/src/lib/api/errors';
import { ROUTES } from '@/src/constants/strings';
import { EMPTY_DASHBOARD_SUMMARY } from '@/src/constants/dashboard';
import type { DashboardSummary } from '@/src/lib/types/dashboard';

/**
 * Depends on the caller's session cookie, so it can never be statically
 * prerendered — always render this route per-request.
 */
export const dynamic = 'force-dynamic';

/**
 * Displays an overview of key metrics, insights, and application data in a centralized dashboard interface.
 *
 * @remarks
 * This page is responsible for rendering the UI
 * for the `dashboard` route.
 *
 * @returns The page UI for the route.
 */
export default async function DashboardPage() {
  let summary: DashboardSummary = EMPTY_DASHBOARD_SUMMARY;

  try {
    const client = getServerApiClient();
    const response = await DashboardApi.getSummary(client);

    summary = response?.data ?? EMPTY_DASHBOARD_SUMMARY;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    throw error;
  }

  return <Dashboard summary={summary} />;
}
