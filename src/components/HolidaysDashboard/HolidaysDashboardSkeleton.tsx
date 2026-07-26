/**
 * A skeleton placeholder for the Holidays dashboard, shown while the holiday list is first loading.
 *
 * @example
 * ```tsx
 * import HolidaysDashboardSkeleton from '@src/components/HolidaysDashboard/HolidaysDashboardSkeleton'
 *
 * export default function Loading() {
 *   return <HolidaysDashboardSkeleton />;
 * }
 * ```
 */

import clsx from 'clsx';
import AppHeader from '../AppHeader';
import { Heading3 } from '../Typography';
import styles from './HolidaysDashboard.module.scss';
import { STRINGS } from '@/src/constants/strings';

const SKELETON_CARD_COUNT = 8;
const SKELETON_ITEM_COUNT = 2;

function HolidayCardSkeleton() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonHeader}>
        <div className={clsx(styles.bone, styles.skeletonTitle)} />
        <div className={clsx(styles.bone, styles.skeletonBadge)} />
      </div>

      <div className={styles.skeletonHolidayList}>
        {Array.from({ length: SKELETON_ITEM_COUNT }).map((_, index) => (
          <div className={styles.skeletonHolidayItem} key={index}>
            <div className={styles.skeletonLeft}>
              <div className={clsx(styles.bone, styles.skeletonDot)} />

              <div className={styles.skeletonContent}>
                <div className={clsx(styles.bone, styles.skeletonName)} />
                <div className={clsx(styles.bone, styles.skeletonDay)} />
              </div>
            </div>

            <div className={clsx(styles.bone, styles.skeletonDate)} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HolidaysDashboardSkeleton() {
  return (
    <div className={styles.container}>
      <AppHeader title={STRINGS.HOLIDAYS} subtitle={STRINGS.ALL_HOLIDAY_LISTS} />

      <div className={styles.content}>
        <div className={styles.topBar}>
          <Heading3>{STRINGS.YEAR}</Heading3>
        </div>

        <div className={styles.cardsGrid}>
          {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
            <HolidayCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
