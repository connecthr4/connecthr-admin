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

import { Heading4, Text2 } from '../Typography';
import { STRINGS } from '@/src/constants/strings';
import { Trash2, CalendarDays, Loader2 } from 'lucide-react';
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
  deletingId?: string | null;
}

export default function HolidayMonthCard({ month, holidays, onDelete, deletingId }: HolidayMonthCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Heading4>{month}</Heading4>
        <div className={styles.count}>
          <Text2 className={styles.countText}>
            {holidays.length} {STRINGS.HOLIDAYS}
          </Text2>
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
                <button
                  className={styles.deleteButton}
                  onClick={() => onDelete(holiday.id)}
                  disabled={Boolean(deletingId)}
                >
                  {deletingId === holiday.id ? <Loader2 size={16} className={styles.spinner} /> : <Trash2 size={16} />}
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
          <Text2 className={styles.emptyText}>{STRINGS.NO_HOLIDAYS_ADDED}</Text2>
        </div>
      )}
    </div>
  );
}
