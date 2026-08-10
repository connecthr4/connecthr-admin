/**
 * @module app/employees/[employeeId]/edit/loading
 */

import EmployeeWizardSkeleton from '@/src/components/EmployeeWizard/EmployeeWizardSkeleton';

/**
 * Instant loading UI shown while the edit route's employee record is being fetched.
 *
 * @remarks
 * Beyond the placeholder itself, this is what makes the route prefetchable: a dynamic page
 * is only prefetched up to its first loading boundary, so without one the browser sits on
 * the details screen for the length of the round trip after "Edit Profile" is clicked.
 *
 * @returns Skeleton placeholder matching the employee wizard layout.
 */
export default function Loading() {
  return <EmployeeWizardSkeleton />;
}
