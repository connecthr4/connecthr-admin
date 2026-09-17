import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import EmployeeAttendance from './EmployeeAttendance';
import styles from './EmployeeAttendance.module.scss';
import { STRINGS } from '@/src/constants/strings';

import type { EmployeeAttendanceRow } from '@/src/lib/types/attendance';

const noOvertime = { hours: 0, minutes: 0, totalMinutes: 0, label: '0h 00m' };

const rows: EmployeeAttendanceRow[] = [
  {
    slNo: 1,
    date: '2026-09-10',
    shift: 'General',
    status: 'PRESENT',
    statusLabel: 'Present',
    overtime: { hours: 1, minutes: 30, totalMinutes: 90, label: '1h 30m' },
    remarks: 'Client call ran late',
    state: 'SUBMITTED',
  },
  {
    slNo: 2,
    date: '2026-09-11',
    shift: null,
    status: null,
    statusLabel: null,
    overtime: noOvertime,
    remarks: null,
    state: null,
  },
  {
    slNo: 3,
    date: '2026-09-12',
    shift: 'Night',
    status: 'HALF_DAY_FIRST_HALF',
    statusLabel: null,
    overtime: noOvertime,
    remarks: null,
    state: 'DRAFT',
  },
];

/** The body row numbered `slNo`. */
const getRow = (slNo: number) => screen.getByText(String(slNo)).closest('tr') as HTMLTableRowElement;

describe('EmployeeAttendance', () => {
  it('renders the read-only columns in order', () => {
    render(<EmployeeAttendance rows={rows} />);

    const headers = screen.getAllByRole('columnheader').map((header) => header.textContent);
    expect(headers).toEqual([
      STRINGS.SL_NO,
      STRINGS.DATE,
      STRINGS.SHIFT,
      STRINGS.STATUS,
      STRINGS.OVERTIME,
      STRINGS.REMARKS,
    ]);
  });

  it('renders a row per day with the backend-resolved labels', () => {
    render(<EmployeeAttendance rows={rows} />);

    const cells = within(getRow(1))
      .getAllByRole('cell')
      .map((cell) => cell.textContent);
    expect(cells).toEqual(['1', '10 Sept 2026', 'General', 'Present', '1h 30m', 'Client call ran late']);
  });

  it('shows a dash for an unmarked day and for fields the backend left empty', () => {
    render(<EmployeeAttendance rows={rows} />);

    const cells = within(getRow(2))
      .getAllByRole('cell')
      .map((cell) => cell.textContent);
    expect(cells).toEqual([
      '2',
      '11 Sept 2026',
      STRINGS.NOT_AVAILABLE,
      STRINGS.NOT_AVAILABLE,
      STRINGS.NOT_AVAILABLE,
      STRINGS.NOT_AVAILABLE,
    ]);
  });

  it('shows a dash rather than "0h 00m" when no overtime was logged', () => {
    render(<EmployeeAttendance rows={rows} />);

    expect(screen.queryByText('0h 00m')).not.toBeInTheDocument();
  });

  it('paints the status pill in the tone of the marking, falling back to the raw value', () => {
    render(<EmployeeAttendance rows={rows} />);

    expect(within(getRow(1)).getByText('Present')).toHaveClass(styles.statusPill, styles.present);
    expect(within(getRow(3)).getByText('HALF_DAY_FIRST_HALF')).toHaveClass(styles.statusPill, styles.halfDay);
  });

  it('shows the whole history at once, with no pager', () => {
    const history = Array.from({ length: 25 }, (_, index) => ({ ...rows[0], slNo: index + 1 }));
    render(<EmployeeAttendance rows={history} />);

    /* Every day, plus the header row. */
    expect(screen.getAllByRole('row')).toHaveLength(history.length + 1);
    expect(screen.queryByText(/out of/)).not.toBeInTheDocument();
  });

  it('shows the skeleton instead of rows while the history is being read', () => {
    render(<EmployeeAttendance rows={rows} isLoading />);

    expect(screen.queryByText('10 Sept 2026')).not.toBeInTheDocument();
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
  });

  it('says no attendance has been recorded rather than "no data" when the history is empty', () => {
    render(<EmployeeAttendance rows={[]} />);

    expect(screen.getByText(STRINGS.NO_ATTENDANCE_RECORDS)).toBeInTheDocument();
  });

  it('shows the failure instead of an empty table, and offers a retry', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<EmployeeAttendance rows={[]} errorMessage="Service unavailable" onRetry={onRetry} />);

    expect(screen.getByText('Service unavailable')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByText(STRINGS.NO_ATTENDANCE_RECORDS)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: STRINGS.TRY_AGAIN }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
