/**
 * @module app/dashboard/layout
 */

import BaseLayout from '@/src/components/BaseLayout';

/**
 * Route layout for the dashboard segment.
 *
 * Defines shared UI and structure for all pages
 * nested within this route.
 *
 * @param children - Nested route content.
 * @returns The rendered route layout.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <BaseLayout>{children}</BaseLayout>;
}
