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

import styles from './StatsSummaryCard.module.scss';

/**
 * Define the props available for the StatsSummaryCard component.
 */
interface StatsSummaryCardProps {
  label?: string;
}

export default function StatsSummaryCard({ label = 'label' }: StatsSummaryCardProps) {
  return <div className={styles.container}>StatsSummaryCard component - {label}</div>;
}
