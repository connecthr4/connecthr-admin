/**
 * A skeleton placeholder for the Dashboard, shown while the summary payload is being fetched.
 *
 * @example
 * ```tsx
 * import DashboardSkeleton from '@src/components/Dashboard/DashboardSkeleton'
 *
 * export default function Loading() {
 *   return <DashboardSkeleton />;
 * }
 * ```
 */

import clsx from 'clsx';
import styles from './Dashboard.module.scss';

const SKELETON_STAT_COUNT = 3;
const SKELETON_HOLIDAY_COUNT = 4;

export default function DashboardSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonHeaderText}>
          <div className={clsx(styles.bone, styles.skeletonTitle)} />
          <div className={clsx(styles.bone, styles.skeletonSubtitle)} />
        </div>

        <div className={clsx(styles.bone, styles.skeletonAvatar)} />
      </div>

      <div className={styles.statsSummaryGrid}>
        {Array.from({ length: SKELETON_STAT_COUNT }).map((_, index) => (
          <div className={styles.skeletonStatCard} key={index}>
            <div className={clsx(styles.bone, styles.skeletonStatLabel)} />
            <div className={clsx(styles.bone, styles.skeletonStatValue)} />
            <div className={clsx(styles.bone, styles.skeletonStatFooter)} />
          </div>
        ))}
      </div>

      <div className={styles.wrapper}>
        <div className={styles.chartWrapper}>
          <div className={clsx(styles.bone, styles.skeletonStatLabel)} />
          <div className={clsx(styles.bone, styles.skeletonChart)} />
        </div>

        <div className={styles.skeletonHolidaysCard}>
          <div className={clsx(styles.bone, styles.skeletonStatLabel)} />

          {Array.from({ length: SKELETON_HOLIDAY_COUNT }).map((_, index) => (
            <div className={styles.skeletonHolidayItem} key={index}>
              <div className={clsx(styles.bone, styles.skeletonDateBox)} />

              <div className={styles.skeletonHolidayContent}>
                <div className={clsx(styles.bone, styles.skeletonStatLabel)} />
                <div className={clsx(styles.bone, styles.skeletonStatFooter)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
