/**
 * Reusable dashboard card component to display upcoming holidays with date, occasion details, and responsive modern UI styling.
 *
 * @example
 * ```tsx
 * import UpcomingHolidaysCard from '@src/components/UpcomingHolidaysCard'
 *
 * export default function UpcomingHolidaysCard() {
 *   return <UpcomingHolidaysCard label="Hello" />;
 * }
 * ```
 */

import { ArrowRight, CalendarDays } from 'lucide-react';
import { STRINGS } from '@/src/constants/strings';
import { Heading3, Text2, Text3 } from '../Typography/Typography';
import type { UpcomingHoliday } from '@/src/lib/types/dashboard';
import styles from './UpcomingHolidaysCard.module.scss';

/**
 * Define the props available for the UpcomingHolidaysCard component.
 */
interface UpcomingHolidaysCardProps {
  /**
   * Holidays to list, already formatted for display by the API
   * (day, short month, weekday and title).
   */
  holidays?: UpcomingHoliday[];
}

export default function UpcomingHolidaysCard({ holidays = [] }: UpcomingHolidaysCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Heading3>{STRINGS.UPCOMING_HOLIDAYS}</Heading3>
        <button className={styles.viewAll}>
          {STRINGS.VIEW_ALL}
          <ArrowRight size={22} />
        </button>
      </div>

      <div className={styles.list}>
        {holidays.length === 0 && <Text2 className={styles.emptyState}>{STRINGS.NO_UPCOMING_HOLIDAYS}</Text2>}

        {holidays.map((holiday) => (
          <div key={holiday.id} className={styles.holidayItem}>
            <div className={styles.dateBox}>
              <Text3 className={styles.dateText}>{holiday.day}</Text3>
              <Text3 className={styles.dateText}>{holiday.month}</Text3>
            </div>

            <div className={styles.divider} />

            <div className={styles.content}>
              <Text2 className={styles.weekday}>{holiday.weekday}</Text2>
              <Text3 className={styles.holidayTitle}>{holiday.title}</Text3>
            </div>

            <div className={styles.iconWrapper}>
              <CalendarDays size={28} className={styles.icon} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
