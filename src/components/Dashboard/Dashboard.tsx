/**
 * Reusable dashboard layout component that displays key metrics, charts, and summary information in a structured interface.
 *
 * @example
 * ```tsx
 * import Dashboard from '@src/components/Dashboard'
 *
 * export default function Dashboard() {
 *   return <Dashboard summary={summary} />;
 * }
 * ```
 */
'use client';

import AppHeader from '@/src/components/AppHeader';
import { useGreeting } from '@/src/hooks/useGreeting';
import styles from './Dashboard.module.scss';
import StatsSummaryCard from '../StatsSummaryCard';
import { Heading3 } from '../Typography';
import BasePieChart from '../BasePieChart';
import UpcomingHolidaysCard from '../UpcomingHolidaysCard';
import { useAuthStore } from '@/src/store/auth/useAuthStore';
import { STRINGS } from '@/src/constants/strings';
import { formatTimestampDate } from '@/src/utils/date';
import { DASHBOARD_ICON_COLOR, DASHBOARD_ICON_SIZE, DASHBOARD_STAT_CARDS } from '@/src/constants/dashboard';
import type { DashboardSummary } from '@/src/lib/types/dashboard';

/**
 * Define the props available for the Dashboard component.
 */
interface DashboardProps {
  /**
   * Counts and upcoming holidays resolved on the server by the dashboard route.
   */
  summary: DashboardSummary;
}

export default function Dashboard({ summary }: DashboardProps) {
  const userDetails = useAuthStore((state) => state.user);
  const greeting = useGreeting();

  const { stats, departmentDistribution, upcomingHolidays } = summary;

  return (
    <div className={styles.container}>
      <AppHeader title={`Hello, ${userDetails?.name || 'User'}`} subtitle={greeting} userDetails={userDetails} />

      <div className={styles.statsSummaryGrid}>
        {DASHBOARD_STAT_CARDS.map(({ key, title, icon: Icon }) => {
          const stat = stats?.[key];

          return (
            <StatsSummaryCard
              key={key}
              title={title}
              /* A metric the backend has no figure for yet comes back as null, not 0. */
              value={stat?.value ?? STRINGS.NOT_AVAILABLE}
              updatedDate={formatTimestampDate(stat?.updatedAt) || STRINGS.NOT_AVAILABLE}
              icon={<Icon height={DASHBOARD_ICON_SIZE} width={DASHBOARD_ICON_SIZE} color={DASHBOARD_ICON_COLOR} />}
            />
          );
        })}
      </div>

      <div className={styles.wrapper}>
        <div className={styles.chartWrapper}>
          <Heading3>{STRINGS.DEPARTMENT_DISTRIBUTION}</Heading3>

          <BasePieChart
            data={departmentDistribution}
            height={320}
            centerValue={String(stats?.totalEmployees?.value ?? STRINGS.NOT_AVAILABLE)}
            centerLabel={STRINGS.EMPLOYEES}
          />
        </div>

        <div className={styles.holidays}>
          <UpcomingHolidaysCard holidays={upcomingHolidays} />
        </div>
      </div>
    </div>
  );
}
