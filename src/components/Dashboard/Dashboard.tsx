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
'use client';

import AppHeader from '@/src/components/AppHeader';
import { useGreeting } from '@/src/hooks/useGreeting';
import styles from './Dashboard.module.scss';
import StatsSummaryCard from '../StatsSummaryCard';
import { Users, CalendarCheck, CalendarMinus } from 'lucide-react';
import { Heading3 } from '../Typography';
import BasePieChart from '../BasePieChart';
import UpcomingHolidaysCard from '../UpcomingHolidaysCard';
import { useAuthStore } from '@/src/store/auth/useAuthStore';

/**
 * Define the props available for the Dashboard component.
 */
export default function Dashboard() {
  const userDetails = useAuthStore((state) => state.user);
  const greeting = useGreeting();

  const dashboardStats = [
    {
      id: 1,
      title: 'Total Employee',
      value: 560,
      updatedDate: 'July 16, 2023',
      icon: <Users height={20} width={20} color="#7152F3" />,
    },
    {
      id: 2,
      title: 'Today Attendance',
      value: 500,
      updatedDate: 'July 14, 2023',
      icon: <CalendarCheck height={20} width={20} color="#7152F3" />,
    },
    {
      id: 3,
      title: 'Today On Leave',
      value: 60,
      updatedDate: 'July 15, 2023',
      icon: <CalendarMinus height={20} width={20} color="#7152F3" />,
    },
  ];

  const data = [
    { name: 'Engineering', value: 35, color: '#3B82F6' },
    { name: 'Marketing', value: 20, color: '#10B981' },
    { name: 'Sales', value: 15, color: '#F59E0B' },
    { name: 'HR', value: 12, color: '#EF4444' },
  ];
  return (
    <div className={styles.container}>
      <AppHeader title={`Hello, ${userDetails?.name || 'User'}`} subtitle={greeting} userDetails={userDetails} />

      <div className={styles.statsSummaryGrid}>
        {dashboardStats.map((item) => (
          <StatsSummaryCard
            key={item.id}
            title={item.title}
            value={item.value}
            updatedDate={item.updatedDate}
            icon={item.icon}
          />
        ))}
      </div>

      <div className={styles.wrapper}>
        <div className={styles.chartWrapper}>
          <Heading3>Department Distribution</Heading3>
          <BasePieChart data={data} height={320} centerValue="560" centerLabel="Employees" />
        </div>
        <div className={styles.holidays}>
          <UpcomingHolidaysCard />
        </div>
      </div>
    </div>
  );
}
