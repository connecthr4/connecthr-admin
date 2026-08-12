/**
 * @module app/dashboard/loading
 */

import DashboardSkeleton from '@/src/components/Dashboard/DashboardSkeleton';

/**
 * Instant loading UI shown while the dashboard route's server data is being fetched.
 *
 * @returns Skeleton placeholder matching the dashboard layout.
 */
export default function Loading() {
  return <DashboardSkeleton />;
}
