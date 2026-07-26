/**
 * @module app/holidays/loading
 */

import HolidaysDashboardSkeleton from '@/src/components/HolidaysDashboard/HolidaysDashboardSkeleton';

/**
 * Instant loading UI shown while the holidays route's server data is being fetched.
 *
 * @returns Skeleton placeholder matching the holidays dashboard layout.
 */
export default function Loading() {
  return <HolidaysDashboardSkeleton />;
}
