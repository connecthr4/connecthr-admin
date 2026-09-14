import { useCallback, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import MarkAttendanceTable from './MarkAttendanceTable';
import { EMPTY_ATTENDANCE_ENTRY, FALLBACK_ATTENDANCE_STATUS_OPTIONS } from '@/src/constants/attendance';
import type { PaginationState } from '@tanstack/react-table';
import type { AttendanceEntries, AttendanceEntry, MarkAttendanceEmployee } from '@/src/lib/types/attendance';

const employees: MarkAttendanceEmployee[] = [
  { id: 'clx-1', employeeId: 'EMP1001', name: 'Darlene Robertson', department: 'Design', shift: 'General' },
  { id: 'clx-2', employeeId: 'EMP1002', name: 'Floyd Miles', department: 'Development', shift: 'General' },
  { id: 'clx-3', employeeId: 'EMP1003', name: 'Cody Fisher', department: 'Sales', shift: 'Night' },
  { id: 'clx-4', employeeId: 'EMP1004', name: 'Theresa Webb', department: 'Marketing', shift: null },
];

const markedEntries: AttendanceEntries = {
  'clx-1': { status: 'PRESENT', overtimeHours: '01', overtimeMinutes: '30', remarks: 'Client call ran late' },
  'clx-2': { status: 'ON_LEAVE', overtimeHours: '', overtimeMinutes: '', remarks: '' },
  'clx-3': { status: 'HALF_DAY_FIRST_HALF', overtimeHours: '', overtimeMinutes: '', remarks: '' },
};

const meta = {
  title: 'components/MarkAttendanceTable',
  component: MarkAttendanceTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    isLoading: {
      control: 'boolean',
      description: 'Shows the skeleton rows while a page is being read',
    },
    isSavingDraft: {
      control: 'boolean',
      description: 'Spins the "Save as Draft" button and holds "Submit Attendance"',
    },
    isSubmitting: {
      control: 'boolean',
      description: 'Spins the "Submit Attendance" button and holds "Save as Draft"',
    },
  },
  args: {
    employees,
    entries: {},
    onEntryChange: fn(),
    statusOptions: FALLBACK_ATTENDANCE_STATUS_OPTIONS,
    search: '',
    onSearchChange: fn(),
    pagination: { pageIndex: 0, pageSize: 10 },
    onPaginationChange: fn(),
    totalItems: employees.length,
    isLoading: false,
    isSavingDraft: false,
    isSubmitting: false,
    onExport: fn(),
    onSaveDraft: fn(),
    onSubmit: fn(),
  },
  /*
  The sheet edits what it is given and reports each change upward, so the story
  keeps the entries — and the controlled search box and pager — itself.
  */
  render: (args) => {
    const [entries, setEntries] = useState<AttendanceEntries>(args.entries);
    const [search, setSearch] = useState(args.search);
    const [pagination, setPagination] = useState<PaginationState>(args.pagination);

    const handleEntryChange = useCallback(
      (employeeId: string, patch: Partial<AttendanceEntry>) => {
        setEntries((previous) => ({
          ...previous,
          [employeeId]: { ...(previous[employeeId] ?? EMPTY_ATTENDANCE_ENTRY), ...patch },
        }));
        args.onEntryChange(employeeId, patch);
      },
      [args]
    );

    return (
      <MarkAttendanceTable
        {...args}
        entries={entries}
        onEntryChange={handleEntryChange}
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
} satisfies Meta<typeof MarkAttendanceTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PartiallyMarked: Story = {
  args: {
    entries: markedEntries,
  },
};

export const Loading: Story = {
  args: {
    employees: [],
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    employees: [],
    totalItems: 0,
  },
};

export const SavingDraft: Story = {
  args: {
    entries: markedEntries,
    isSavingDraft: true,
  },
};

export const Submitting: Story = {
  args: {
    entries: markedEntries,
    isSubmitting: true,
  },
};
