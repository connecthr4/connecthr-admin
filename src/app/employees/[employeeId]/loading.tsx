/**
 * @module app/employees/[employeeId]/loading
 */

import EmployeeDetailsSkeleton from '@/src/components/EmployeeDetails/EmployeeDetailsSkeleton';

/**
 * Instant loading UI shown while the details route's employee record is being fetched.
 *
 * @remarks
 * The route is `force-dynamic`, so without a loading boundary the click on a row's view
 * action does nothing visible: the browser stays on the employee list, frozen, for the whole
 * round trip. This wraps the page in a Suspense boundary, so the skeleton appears the moment
 * the navigation starts and the record streams in behind it.
 *
 * It is also what makes the route prefetchable — a dynamic page is only prefetched as far as
 * its first loading boundary — which is what the list's hover prefetch warms.
 *
 * @returns Skeleton placeholder matching the employee details layout.
 */
export default function Loading() {
  return <EmployeeDetailsSkeleton />;
}
