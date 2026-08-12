/**
 * A single headline metric on the dashboard. `value`/`updatedAt` are null until
 * the backend has something to report for that metric.
 */
export interface DashboardStat {
  value: number | null;
  updatedAt: string | null;
}

export type DashboardStatKey = 'totalEmployees' | 'todayAttendance' | 'todayOnLeave';

export type DashboardStats = Record<DashboardStatKey, DashboardStat>;

export interface UpcomingHoliday {
  id: string;
  day: string;
  month: string;
  weekday: string;
  title: string;
}

export interface DashboardSummary {
  stats: DashboardStats;
  upcomingHolidays: UpcomingHoliday[];
}

export interface GetDashboardSummaryResponse {
  success: boolean;
  message: string;
  data: DashboardSummary;
}
