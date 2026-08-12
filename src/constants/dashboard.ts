import { Users, CalendarCheck, CalendarMinus } from 'lucide-react';
import { STRINGS } from './strings';
import type { DashboardStatKey, DashboardSummary } from '../lib/types/dashboard';

export const DASHBOARD_ICON_SIZE = 20;
export const DASHBOARD_ICON_COLOR = '#7152F3';

/**
 * Drives the stats row: each entry maps a card to its key in the summary payload,
 * so a metric is rendered from the API response rather than from a parallel list.
 */
export const DASHBOARD_STAT_CARDS = [
  {
    key: 'totalEmployees',
    title: STRINGS.TOTAL_EMPLOYEE,
    icon: Users,
  },
  {
    key: 'todayAttendance',
    title: STRINGS.TODAY_ATTENDANCE,
    icon: CalendarCheck,
  },
  {
    key: 'todayOnLeave',
    title: STRINGS.TODAY_ON_LEAVE,
    icon: CalendarMinus,
  },
] as const satisfies ReadonlyArray<{ key: DashboardStatKey; title: string; icon: React.ElementType }>;

/**
 * Rendered when the summary endpoint returns nothing usable — every metric then
 * falls back to the `--` placeholder instead of the dashboard failing to render.
 */
export const EMPTY_DASHBOARD_SUMMARY: DashboardSummary = {
  stats: {
    totalEmployees: { value: null, updatedAt: null },
    todayAttendance: { value: null, updatedAt: null },
    todayOnLeave: { value: null, updatedAt: null },
  },
  upcomingHolidays: [],
};

/**
 * Placeholder distribution — the summary endpoint does not expose chart data yet,
 * so the pie chart is still driven by static values.
 */
export const DEPARTMENT_DISTRIBUTION = [
  { name: 'Engineering', value: 35, color: '#3B82F6' },
  { name: 'Marketing', value: 20, color: '#10B981' },
  { name: 'Sales', value: 15, color: '#F59E0B' },
  { name: 'HR', value: 12, color: '#EF4444' },
];
