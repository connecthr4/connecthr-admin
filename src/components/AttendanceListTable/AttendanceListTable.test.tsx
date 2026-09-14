import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import AttendanceListTable from './AttendanceListTable';
import styles from './AttendanceListTable.module.scss';
import { STRINGS } from '@/src/constants/strings';
import { FALLBACK_ATTENDANCE_STATUS_OPTIONS } from '@/src/constants/attendance';

import type { AttendanceSheetRow } from '@/src/lib/types/attendance';
import type { FilterOptions } from '@/src/lib/types/filters';

const noOvertime = { hours: 0, minutes: 0, totalMinutes: 0, label: '0h 00m' };

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
    department: '',
    shiftCode: null,
    shift: null,
    status: null,
    statusLabel: null,
    overtime: noOvertime,
    remarks: null,
    state: null,
  },
  {
    employeeId: 'clx-3',
    employeeCode: 'EMP1003',
    name: 'Cody Fisher',
    department: 'Sales',
    shiftCode: 'NGT',
    shift: 'Night',
    status: 'HALF_DAY_FIRST_HALF',
    statusLabel: null,
    overtime: noOvertime,
    remarks: null,
    state: 'DRAFT',
  },
];

const filterOptions: FilterOptions = [
  {
    id: 'departments',
    label: STRINGS.DEPARTMENT,
    isMulti: true,
    options: [{ label: 'Design', value: 'Design' }],
  },
  {
    id: 'statuses',
    label: STRINGS.ATTENDANCE_STATUS,
    isMulti: true,
    options: FALLBACK_ATTENDANCE_STATUS_OPTIONS,
  },
];

const baseProps = {
  rows,
  search: '',
  onSearchChange: vi.fn(),
  filterOptions,
  onFilterChange: vi.fn(),
  pagination: { pageIndex: 0, pageSize: 10 },
  onPaginationChange: vi.fn(),
  totalItems: rows.length,
};

/** The body row for the employee with `code`. */
const getRow = (code: string) => screen.getByText(code).closest('tr') as HTMLTableRowElement;

describe('AttendanceListTable', () => {
  it('renders the read-only columns in order', () => {
    render(<AttendanceListTable {...baseProps} />);

    const headers = screen.getAllByRole('columnheader').map((header) => header.textContent);
    expect(headers).toEqual([
      STRINGS.EMPLOYEE_ID,
      STRINGS.EMPLOYEE_NAME,
      STRINGS.DEPARTMENT,
      STRINGS.SHIFT,
      STRINGS.ATTENDANCE_STATUS,
      STRINGS.OVERTIME,
      STRINGS.REMARKS,
    ]);
  });

  it('renders a row per record with the backend-resolved labels', () => {
    render(<AttendanceListTable {...baseProps} />);

    const cells = within(getRow('EMP1001'))
      .getAllByRole('cell')
      .map((cell) => cell.textContent);
    expect(cells).toEqual([
      'EMP1001',
      'Darlene Robertson',
      'Design',
      'General',
      'Present',
      '1h 30m',
      'Client call ran late',
    ]);
  });

  it('shows a dash for an unmarked row and for fields the backend left empty', () => {
    render(<AttendanceListTable {...baseProps} />);

    const cells = within(getRow('EMP1002'))
      .getAllByRole('cell')
      .map((cell) => cell.textContent);
    expect(cells).toEqual([
      'EMP1002',
      'Floyd Miles',
      STRINGS.NOT_AVAILABLE,
      STRINGS.NOT_AVAILABLE,
      STRINGS.NOT_AVAILABLE,
      STRINGS.NOT_AVAILABLE,
      STRINGS.NOT_AVAILABLE,
    ]);
  });

  it('shows a dash rather than "0h 00m" when no overtime was logged', () => {
    render(<AttendanceListTable {...baseProps} />);

    expect(screen.queryByText('0h 00m')).not.toBeInTheDocument();
  });

  it('paints the status pill in the tone of the marking', () => {
    render(<AttendanceListTable {...baseProps} />);

    const present = within(getRow('EMP1001')).getByText('Present');
    expect(present).toHaveClass(styles.statusPill, styles.present);

    const halfDay = within(getRow('EMP1003')).getByText('HALF_DAY_FIRST_HALF');
    expect(halfDay).toHaveClass(styles.statusPill, styles.halfDay);
  });

  it('falls back to the raw status value when the backend sent no label', () => {
    render(<AttendanceListTable {...baseProps} />);

    expect(within(getRow('EMP1003')).getByText('HALF_DAY_FIRST_HALF')).toBeInTheDocument();
  });

  it('renders the toolbar search box with the employee placeholder and reports typing', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(<AttendanceListTable {...baseProps} onSearchChange={onSearchChange} />);

    await user.type(screen.getByPlaceholderText(STRINGS.SEARCH_EMPLOYEE_NAME_OR_ID), 'D');

    expect(onSearchChange).toHaveBeenCalledWith('D');
  });

  it('hands the filter groups to the toolbar and reports the applied selection', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(<AttendanceListTable {...baseProps} onFilterChange={onFilterChange} />);

    await user.click(screen.getByLabelText('Design'));
    /* The panel is a native popover, which jsdom never shows — hence `hidden`. */
    await user.click(screen.getByRole('button', { name: STRINGS.APPLY_FILTER, hidden: true }));

    expect(onFilterChange).toHaveBeenCalledWith({ departments: ['Design'] });
  });

  it('renders toolbar actions passed as children', () => {
    render(
      <AttendanceListTable {...baseProps}>
        <button type="button">Export</button>
      </AttendanceListTable>
    );

    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
  });

  it('shows the skeleton instead of rows while loading', () => {
    render(<AttendanceListTable {...baseProps} isLoading />);

    expect(screen.queryByText('EMP1001')).not.toBeInTheDocument();
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
  });

  it('shows the empty state when there are no records', () => {
    render(<AttendanceListTable {...baseProps} rows={[]} totalItems={0} />);

    expect(screen.getByText(STRINGS.NO_DATA_FOUND)).toBeInTheDocument();
  });

  it('pages on the server: the range reads from totalItems and page turns go to the parent', async () => {
    const user = userEvent.setup();
    const onPaginationChange = vi.fn();
    render(<AttendanceListTable {...baseProps} totalItems={42} onPaginationChange={onPaginationChange} />);

    expect(screen.getByText(`${STRINGS.SHOWING} 1 to 10 out of 42 records`)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next page' }));

    expect(onPaginationChange).toHaveBeenCalledWith({ pageIndex: 1, pageSize: 10 });
  });
});
