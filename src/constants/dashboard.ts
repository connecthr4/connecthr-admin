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
  departmentDistribution: [],
  upcomingHolidays: [],
};
