import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import EmployeeAttendance from './EmployeeAttendance';
import { STRINGS } from '@/src/constants/strings';

import type { EmployeeAttendanceRow } from '@/src/lib/types/attendance';

const rows: EmployeeAttendanceRow[] = [
  {
    slNo: 1,
    date: '2026-09-10',
    shift: 'General',
    status: 'PRESENT',
    statusLabel: 'Present',
    overtime: { hours: 0, minutes: 0, totalMinutes: 0, label: '0h 00m' },
    remarks: null,
    state: 'SUBMITTED',
  },
  {
    slNo: 2,
    date: '2026-09-11',
    shift: 'General',
    status: 'PRESENT',
    statusLabel: 'Present',
    overtime: { hours: 1, minutes: 30, totalMinutes: 90, label: '1h 30m' },
    remarks: 'Client call ran late',
    state: 'SUBMITTED',
  },
  {
    slNo: 3,
    date: '2026-09-12',
    shift: 'Night',
    status: 'HALF_DAY_FIRST_HALF',
    statusLabel: 'Half Day (First Half)',
    overtime: { hours: 0, minutes: 0, totalMinutes: 0, label: '0h 00m' },
    remarks: null,
    state: 'SUBMITTED',
  },
  {
    slNo: 4,
    date: '2026-09-13',
    shift: 'General',
    status: 'ON_LEAVE',
    statusLabel: 'On Leave',
    overtime: { hours: 0, minutes: 0, totalMinutes: 0, label: '0h 00m' },
    remarks: 'Approved leave',
    state: 'SUBMITTED',
  },
  {
    slNo: 5,
    date: '2026-09-14',
    shift: null,
    status: null,
    statusLabel: null,
    overtime: { hours: 0, minutes: 0, totalMinutes: 0, label: '0h 00m' },
    remarks: null,
    state: null,
  },
];

const meta = {
  title: 'components/EmployeeAttendance',
  component: EmployeeAttendance,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    rows: { description: 'Every day on record for the employee' },
    isLoading: { control: 'boolean', description: 'Draws the table skeleton while the history is read' },
    errorMessage: { control: 'text', description: 'Shown instead of the table when the read failed' },
  },
  args: {
    rows,
    isLoading: false,
    onRetry: fn(),
  },
} satisfies Meta<typeof EmployeeAttendance>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { isLoading: true },
};

/** No attendance yet — told apart from a read that failed. */
export const Empty: Story = {
  args: { rows: [] },
};

export const Failed: Story = {
  args: { errorMessage: STRINGS.EMPLOYEE_ATTENDANCE_FETCH_FAILED },
};
