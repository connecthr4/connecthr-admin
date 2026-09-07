/**
 * @module app/attendance/layout
 */

import BaseLayout from '@/src/components/BaseLayout';

/**
 * Route layout for the attendance segment.
 *
 * Defines shared UI and structure for all pages
 * nested within this route — Mark Attendance and Attendance List.
 *
 * @param children - Nested route content.
 * @returns The rendered route layout.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <BaseLayout>{children}</BaseLayout>;
}
