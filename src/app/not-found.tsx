/**
 * @module app/not-found
 */

import NotFoundScreen from '@/src/components/NotFoundScreen';

/**
 * The 404 screen for the whole application.
 *
 * Next.js renders this both for a `notFound()` thrown by a route segment that has no
 * `not-found` of its own, and for any URL that matches no route at all.
 *
 * Deliberately outside `BaseLayout`: the sidebar it draws needs a signed-in user, and the
 * public routes (`/login`, `/reset-password`) are reached without one — so an unmatched URL
 * under those would otherwise render a nav for nobody.
 *
 * @returns The not-found UI.
 */
export default function NotFound() {
  return <NotFoundScreen />;
}
