import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Download } from 'lucide-react';
import AttendanceListTable from './AttendanceListTable';
import Button from '../Button';
import { STRINGS } from '@/src/constants/strings';
import { FALLBACK_ATTENDANCE_STATUS_OPTIONS } from '@/src/constants/attendance';
import type { PaginationState } from '@tanstack/react-table';
import type { AttendanceSheetRow } from '@/src/lib/types/attendance';
import type { FilterOptions } from '@/src/lib/types/filters';

const rows: AttendanceSheetRow[] = [
  {
    employeeId: 'clx-1',
    employeeCode: 'EMP1001',
    name: 'Darlene Robertson',
    department: 'Design',
    shiftCode: 'GEN',
    shift: 'General',
    status: 'PRESENT',
    statusLabel: 'Present',
    overtime: { hours: 1, minutes: 30, totalMinutes: 90, label: '1h 30m' },
    remarks: 'Client call ran late',
    state: 'SUBMITTED',
  },
  {
    employeeId: 'clx-2',
    employeeCode: 'EMP1002',
    name: 'Floyd Miles',
    department: 'Development',
    shiftCode: 'GEN',
    shift: 'General',
    status: 'ON_LEAVE',
    statusLabel: 'On Leave',
    overtime: { hours: 0, minutes: 0, totalMinutes: 0, label: '0h 00m' },
    remarks: null,
    state: 'SUBMITTED',
  },
  {
    employeeId: 'clx-3',
    employeeCode: 'EMP1003',
    name: 'Cody Fisher',
    department: 'Sales',
    shiftCode: 'NGT',
    shift: 'Night',
    status: 'HALF_DAY_FIRST_HALF',
    statusLabel: 'Half Day (First Half)',
    overtime: { hours: 0, minutes: 0, totalMinutes: 0, label: '0h 00m' },
    remarks: null,
    state: 'SUBMITTED',
  },
  {
    employeeId: 'clx-4',
    employeeCode: 'EMP1004',
    name: 'Theresa Webb',
    department: 'Marketing',
    shiftCode: null,
    shift: null,
    status: null,
    statusLabel: null,
    overtime: { hours: 0, minutes: 0, totalMinutes: 0, label: '0h 00m' },
    remarks: null,
    state: null,
  },
];

const filterOptions: FilterOptions = [
  {
    id: 'departments',
    label: STRINGS.DEPARTMENT,
    isMulti: true,
    options: [
      { label: 'Design', value: 'Design' },
      { label: 'Development', value: 'Development' },
      { label: 'Sales', value: 'Sales' },
    ],
  },
  {
    id: 'statuses',
    label: STRINGS.ATTENDANCE_STATUS,
    isMulti: true,
    options: FALLBACK_ATTENDANCE_STATUS_OPTIONS,
  },
];

const meta = {
  title: 'components/AttendanceListTable',
  component: AttendanceListTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    isLoading: {
      control: 'boolean',
      description: 'Shows the skeleton rows while a page is being read',
    },
    totalItems: {
      control: 'number',
      description: 'Total records in scope, across every page',
    },
  },
  args: {
    rows,
    search: '',
    onSearchChange: fn(),
    filterOptions,
    onFilterChange: fn(),
    pagination: { pageIndex: 0, pageSize: 10 },
    onPaginationChange: fn(),
    totalItems: rows.length,
    isLoading: false,
  },
  /* The search box and pager are controlled, so the story holds their state. */
  render: (args) => {
    const [search, setSearch] = useState(args.search);
    const [pagination, setPagination] = useState<PaginationState>(args.pagination);

    return (
      <AttendanceListTable
        {...args}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          args.onSearchChange(value);
        }}
        pagination={pagination}
        onPaginationChange={(next) => {
          setPagination(next);
          args.onPaginationChange(next);
        }}
      />
    );
  },
} satisfies Meta<typeof AttendanceListTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithExportAction: Story = {
  args: {
    children: (
      <Button variant="secondary" startIcon={Download}>
        {STRINGS.EXPORT}
      </Button>
    ),
  },
};

export const Loading: Story = {
  args: {
    rows: [],
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    rows: [],
    totalItems: 0,
  },
};

export const Paginated: Story = {
  args: {
    totalItems: 42,
  },
};
