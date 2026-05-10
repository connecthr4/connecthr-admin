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
import styles from './UpcomingHolidaysCard.module.scss';

/**
 * Define the props available for the UpcomingHolidaysCard component.
 */
interface UpcomingHolidaysCardProps {
  label?: string;
}

export default function UpcomingHolidaysCard({ label = 'label' }: UpcomingHolidaysCardProps) {
  const holidays = [
    {
      id: 1,
      day: '10',
      month: 'JUL',
      weekday: 'Monday',
      title: 'Eid-ul-Adha',
      duration: '1 Day',
    },
    {
      id: 2,
      day: '15',
      month: 'AUG',
      weekday: 'Tuesday',
      title: 'Independence Day',
      duration: '1 Day',
    },
    {
      id: 3,
      day: '07',
      month: 'SEP',
      weekday: 'Thursday',
      title: 'Janmashtami',
      duration: '1 Day',
    },
    {
      id: 4,
      day: '02',
      month: 'OCT',
      weekday: 'Monday',
      title: 'Gandhi Jayanti',
      duration: '1 Day',
    },
    {
      id: 5,
      day: '12',
      month: 'NOV',
      weekday: 'Sunday',
      title: 'Diwali',
      duration: '1 Day',
    },
  ];
  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Upcoming Holidays</h2>

        <button className={styles.viewAll}>
          View all
          <ArrowRight size={22} />
        </button>
      </div>

      {/* Holiday List */}
      <div className={styles.list}>
        {holidays.map((holiday) => (
          <div key={holiday.id} className={styles.holidayItem}>
            {/* Date Box */}
            <div className={styles.dateBox}>
              <span className={styles.day}>{holiday.day}</span>

              <span className={styles.month}>{holiday.month}</span>
            </div>

            {/* Divider */}
            <div className={styles.divider} />

            {/* Content */}
            <div className={styles.content}>
              <p className={styles.weekday}>{holiday.weekday}</p>
              <h3 className={styles.holidayTitle}>{holiday.title}</h3>
            </div>

            {/* Icon */}
            <div className={styles.iconWrapper}>
              <CalendarDays size={28} className={styles.icon} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
