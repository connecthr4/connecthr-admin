/**
 * @module app/holidays/layout
 */

import { redirect } from 'next/navigation';
import BaseLayout from '@/src/components/BaseLayout';
import { getSession } from '@/src/lib/auth/session';
import { ROUTES } from '@/src/constants/strings';

/**
 * Route layout for the holidays segment.
 *
 * Defines shared UI and structure for all pages
 * nested within this route.
 *
 * Gates on the session cookie here, outside of `loading.tsx`'s Suspense
 * boundary, so an unauthenticated visit gets an instant server redirect
 * instead of streaming past the boundary as a client-side one.
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
