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

/**
 * One slice of the department pie chart. The API sends no colour — the chart
 * assigns one from the shared categorical palette.
 */
export interface DepartmentDistribution {
  name: string;
  value: number;
}

export interface DashboardSummary {
  stats: DashboardStats;
  departmentDistribution: DepartmentDistribution[];
  upcomingHolidays: UpcomingHoliday[];
}

export interface GetDashboardSummaryResponse {
  success: boolean;
  message: string;
  data: DashboardSummary;
}
