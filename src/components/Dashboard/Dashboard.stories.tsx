import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Dashboard from './Dashboard';
import { EMPTY_DASHBOARD_SUMMARY } from '@/src/constants/dashboard';

const meta = {
  title: 'components/Dashboard',
  component: Dashboard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    summary: {
      stats: {
        totalEmployees: { value: 23, updatedAt: '2026-08-07T04:03:45.574Z' },
        todayAttendance: { value: 20, updatedAt: '2026-08-07T04:03:45.574Z' },
        todayOnLeave: { value: 3, updatedAt: '2026-08-07T04:03:45.574Z' },
      },
      upcomingHolidays: [
        { id: '1', day: '15', month: 'AUG', weekday: 'Saturday', title: 'Independence Day' },
        { id: '2', day: '02', month: 'OCT', weekday: 'Friday', title: 'Gandhi Jayanti' },
      ],
    },
  },
} satisfies Meta<typeof Dashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * Metrics the backend has no figure for yet come back as `null` and render as `--`.
 */
export const WithoutData: Story = {
  args: {
    summary: EMPTY_DASHBOARD_SUMMARY,
  },
};
