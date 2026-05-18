/**
 * Reusable dashboard layout component that displays key metrics, charts, and summary information in a structured interface.
 *
 * @example
 * ```tsx
 * import Dashboard from '@src/components/Dashboard'
 *
 * export default function Dashboard() {
 *   return <Dashboard label="Hello" />;
 * }
 * ```
 */

import AppHeader from '@/src/components/AppHeader';
import { getGreeting } from '@/src/utils/date';
import styles from './Dashboard.module.scss';

/**
 * Define the props available for the Dashboard component.
 */
interface DashboardProps {
  label?: string;
}

export default function Dashboard({ label = 'label' }: DashboardProps) {
  return (
    <div className={styles.container}>
      <AppHeader title="Hello Robert" subtitle={getGreeting()} />
    </div>
  );
}
