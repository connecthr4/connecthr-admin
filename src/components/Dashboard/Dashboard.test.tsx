import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Dashboard from './Dashboard';
import DashboardSkeleton from './DashboardSkeleton';
import styles from './Dashboard.module.scss';
import { useAuthStore } from '@/src/store/auth';
import { ROLES } from '@/src/lib/auth/roles';
import { STRINGS } from '@/src/constants/strings';
import { EMPTY_DASHBOARD_SUMMARY } from '@/src/constants/dashboard';

import type { User } from '@/src/lib/types/auth';
import type { DashboardSummary, DepartmentDistribution, UpcomingHoliday } from '@/src/lib/types/dashboard';

vi.mock('@/src/hooks/useGreeting', () => ({
  useGreeting: () => 'Good Morning',
}));

vi.mock('@/src/components/AppHeader', () => ({
  default: ({ title, subtitle, userDetails }: { title: string; subtitle?: string; userDetails?: User | null }) => (
    <header>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      <span>{`header-user:${userDetails?.email ?? 'none'}`}</span>
    </header>
  ),
}));

vi.mock('../StatsSummaryCard', () => ({
  default: ({ title, value, updatedDate }: { title: string; value: string | number; updatedDate: string }) => (
    <div data-testid="stat-card">
      <span>{title}</span>
      <span>{`value:${value}`}</span>
      <span>{`updated:${updatedDate}`}</span>
    </div>
  ),
}));

vi.mock('../BasePieChart', () => ({
  default: ({
    data,
    centerValue,
    centerLabel,
  }: {
    data: DepartmentDistribution[];
    centerValue?: string;
    centerLabel?: string;
  }) => (
    <div data-testid="pie-chart">
      <span>{`slices:${data.map((slice) => slice.name).join(',')}`}</span>
      <span>{`center:${centerValue}/${centerLabel}`}</span>
    </div>
  ),
}));

vi.mock('../UpcomingHolidaysCard', () => ({
  default: ({ holidays }: { holidays?: UpcomingHoliday[] }) => (
    <div data-testid="holidays-card">{`holidays:${(holidays ?? []).map((holiday) => holiday.title).join(',')}`}</div>
  ),
}));

const user: User = {
  id: 'clx-current',
  name: 'Jane Doe',
  email: 'jane@example.com',
  role: ROLES.ADMIN,
  status: 'ACTIVE',
  mustChangePassword: false,
};

const summary: DashboardSummary = {
  stats: {
    totalEmployees: { value: 560, updatedAt: '2026-07-16T09:00:00.000Z' },
    todayAttendance: { value: 470, updatedAt: '2026-07-16T09:00:00.000Z' },
    todayOnLeave: { value: 12, updatedAt: '2026-07-16T09:00:00.000Z' },
  },
  departmentDistribution: [
    { name: 'Design', value: 12 },
    { name: 'Development', value: 30 },
  ],
  upcomingHolidays: [{ id: '1', day: '15', month: 'Aug', weekday: 'Saturday', title: 'Independence Day' }],
};

describe('Dashboard', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it('greets the signed-in user by name with the time-of-day greeting', () => {
    useAuthStore.getState().setUser(user);
    render(<Dashboard summary={summary} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Hello, Jane Doe' })).toBeInTheDocument();
    expect(screen.getByText('Good Morning')).toBeInTheDocument();
    expect(screen.getByText('header-user:jane@example.com')).toBeInTheDocument();
  });

  it('falls back to "User" when nobody is in the store', () => {
    render(<Dashboard summary={summary} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Hello, User' })).toBeInTheDocument();
  });

  it('renders one stat card per headline metric with its value', () => {
    render(<Dashboard summary={summary} />);

    expect(screen.getAllByTestId('stat-card')).toHaveLength(3);
    expect(screen.getByText(STRINGS.TOTAL_EMPLOYEE)).toBeInTheDocument();
    expect(screen.getByText(STRINGS.TODAY_ATTENDANCE)).toBeInTheDocument();
    expect(screen.getByText(STRINGS.TODAY_ON_LEAVE)).toBeInTheDocument();

    expect(screen.getByText('value:560')).toBeInTheDocument();
    expect(screen.getByText('value:470')).toBeInTheDocument();
    expect(screen.getByText('value:12')).toBeInTheDocument();
  });

  it('formats each metric’s updated timestamp', () => {
    render(<Dashboard summary={summary} />);

    const updated = screen.getAllByText(/^updated:/);
    expect(updated).toHaveLength(3);
    for (const node of updated) {
      expect(node.textContent).not.toBe(`updated:${STRINGS.NOT_AVAILABLE}`);
      expect(node.textContent).not.toBe('updated:');
    }
  });

  it('shows placeholders for metrics the backend has no figure for', () => {
    render(<Dashboard summary={EMPTY_DASHBOARD_SUMMARY} />);

    expect(screen.getAllByText(`value:${STRINGS.NOT_AVAILABLE}`)).toHaveLength(3);
    expect(screen.getAllByText(`updated:${STRINGS.NOT_AVAILABLE}`)).toHaveLength(3);
  });

  it('feeds the department distribution to the pie chart with the head count in the centre', () => {
    render(<Dashboard summary={summary} />);

    expect(screen.getByText(STRINGS.DEPARTMENT_DISTRIBUTION)).toBeInTheDocument();
    expect(screen.getByText('slices:Design,Development')).toBeInTheDocument();
    expect(screen.getByText(`center:560/${STRINGS.EMPLOYEES}`)).toBeInTheDocument();
  });

  it('shows a placeholder in the chart centre when the head count is unknown', () => {
    render(<Dashboard summary={EMPTY_DASHBOARD_SUMMARY} />);

    expect(screen.getByText(`center:${STRINGS.NOT_AVAILABLE}/${STRINGS.EMPLOYEES}`)).toBeInTheDocument();
  });

  it('hands the upcoming holidays to the holidays card', () => {
    render(<Dashboard summary={summary} />);

    expect(screen.getByText('holidays:Independence Day')).toBeInTheDocument();
  });
});

describe('DashboardSkeleton', () => {
  it('renders placeholder bones for the header, three stat cards, the chart and four holidays', () => {
    const { container } = render(<DashboardSkeleton />);

    expect(container.querySelectorAll(`.${styles.skeletonStatCard}`)).toHaveLength(3);
    expect(container.querySelectorAll(`.${styles.skeletonHolidayItem}`)).toHaveLength(4);
    expect(container.querySelector(`.${styles.skeletonChart}`)).toBeInTheDocument();
    expect(container.querySelector(`.${styles.skeletonAvatar}`)).toBeInTheDocument();
  });

  it('renders no real content', () => {
    render(<DashboardSkeleton />);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByText(/Hello/)).not.toBeInTheDocument();
  });
});
