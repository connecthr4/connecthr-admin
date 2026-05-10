/**
 * Reusable dashboard card component to display key HR metrics like employees, applicants, attendance, and projects with trends and update info.
 *
 * @example
 * ```tsx
 * import StatsSummaryCard from '@src/components/StatsSummaryCard'
 *
 * export default function StatsSummaryCard() {
 *   return <StatsSummaryCard label="Hello" />;
 * }
 * ```
 */

import { Heading2, Text2 } from '../Typography';
import styles from './StatsSummaryCard.module.scss';

/**
 * Define the props available for the StatsSummaryCard component.
 */
interface StatsSummaryCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  updatedDate: string;
}

export default function StatsSummaryCard({ title, value, icon, updatedDate }: StatsSummaryCardProps) {
  return (
    <div className={styles.statsCard}>
      <div className={styles.statsCardContent}>
        <div className={styles.statsCardHeader}>
          <div className={styles.statsCardIcon}>{icon}</div>
          <Text2>{title}</Text2>
        </div>
        <Heading2>{value}</Heading2>
      </div>
      <div className={styles.statsCardFooter}>
        <Text2 className={styles.statsCardUpdatedText}>{`Updated: ${updatedDate}`}</Text2>
      </div>
    </div>
  );
}
