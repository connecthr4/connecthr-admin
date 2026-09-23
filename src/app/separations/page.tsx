/**
 * @module app/separations/page
 */

import { redirect } from 'next/navigation';
import SeparationsDashboard from '@/src/components/SeparationsDashboard';
import { getServerApiClient } from '@/src/lib/api/getServerApiClient';
import { SeparationApi } from '@/src/lib/api/separation';
import { UnauthorizedError } from '@/src/lib/api/errors';
import { getCurrentUser } from '@/src/lib/server/currentUser';
import { ROUTES } from '@/src/constants/strings';
import { logger } from '@/src/lib/logger';
import type { SeparationListItem, SeparationListMeta } from '@/src/lib/types/separation';

const DEFAULT_PAGE_SIZE = 10;

/**
 * Depends on the caller's session cookie, so it can never be statically
 * prerendered — always render this route per-request.
 */
export const dynamic = 'force-dynamic';

/**
 * Lists every separation that has been filed, and opens each submission in a drawer.
 *
 * @remarks
 * This page is responsible for rendering the UI
 * for the `separations` route.
 *
 * Only the first page is fetched here; the table asks for the rest through the
 * `getSeparations` Server Function as the user pages. The per-separation detail is not
 * fetched at all — the drawer reads it on open, since the reason and notes are what the list
 * deliberately leaves out.
 *
 * @returns The page UI for the route.
 */
export default async function SeparationsPage() {
  const currentUser = await getCurrentUser();

  let initialSeparations: SeparationListItem[] = [];
  let initialMeta: SeparationListMeta = {
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  try {
    const client = getServerApiClient();
    const response = await SeparationApi.getSeparations(client, { page: 1, limit: DEFAULT_PAGE_SIZE });

    initialSeparations = response?.data?.separations ?? [];
    initialMeta = response?.data?.meta ?? initialMeta;
  } catch (error) {
    logger.error('Error fetching initial data for SeparationsPage:', error);

    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    throw error;
  }

  return (
    <SeparationsDashboard initialSeparations={initialSeparations} initialMeta={initialMeta} currentUser={currentUser} />
  );
}
