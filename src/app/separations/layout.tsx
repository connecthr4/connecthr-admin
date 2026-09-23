/**
 * @module app/separations/layout
 */

import { redirect } from 'next/navigation';
import BaseLayout from '@/src/components/BaseLayout';
import { getSession } from '@/src/lib/auth/session';
import { ROUTES } from '@/src/constants/strings';

/**
 * Route layout for the separations segment.
 *
 * Defines shared UI and structure for all pages
 * nested within this route.
 *
 * Gates on the session cookie here, as the holidays segment does, so an unauthenticated
 * visit gets an instant server redirect rather than a screen that renders and then fails.
 *
 * @param children - Nested route content.
 * @returns The rendered route layout.
 */
export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect(ROUTES.LOGIN);
  }

  return <BaseLayout>{children}</BaseLayout>;
}
