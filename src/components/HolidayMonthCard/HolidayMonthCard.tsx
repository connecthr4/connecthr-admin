/**
 * A reusable card component for displaying monthly holiday lists with support for scrolling, empty states, and holiday deletion actions.
 *
 * @example
 * ```tsx
 * <HolidayMonthCard
 *   month="January"
 *   holidays={holidays}
 *   onDelete={(id) => console.log(id)}
 * />
 * ```
 */

import { Trash2, CalendarDays } from 'lucide-react';
import { Heading4, Text2 } from '../Typography';
import styles from './HolidayMonthCard.module.scss';

interface Holiday {
  id: string;
  name: string;
  date: string;
  day: string;
}

/**
 * Define the props available for the HolidayMonthCard component.
 */
interface HolidayMonthCardProps {
  month: string;
  holidays: Holiday[];
  onDelete: (id: string) => void;
}

export default function HolidayMonthCard({ month, holidays, onDelete }: HolidayMonthCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Heading4>{month}</Heading4>

        <div className={styles.count}>
          <Text2 className={styles.countText}>{holidays.length} Holidays</Text2>
        </div>
      </div>

      {holidays.length > 0 ? (
        <div className={styles.holidayList}>
          {holidays.map((holiday) => (
            <div key={holiday.id} className={styles.holidayItem}>
              <div className={styles.left}>
                <div className={styles.dot} />

                <div className={styles.content}>
                  <Text2>{holiday.name}</Text2>

                  <Text2 className={styles.day}>{holiday.day}</Text2>
                </div>
              </div>

              <div className={styles.right}>
                <Text2 className={styles.date}>{holiday.date}</Text2>

                <button className={styles.deleteButton} onClick={() => onDelete(holiday.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <CalendarDays size={48} />
          </div>

          <Text2 className={styles.emptyText}>No holidays added yet</Text2>
        </div>
      )}
    </div>
  );
}
