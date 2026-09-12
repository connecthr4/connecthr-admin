import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import MarkAttendanceTable from './MarkAttendanceTable';
import styles from './MarkAttendanceTable.module.scss';
import { STRINGS } from '@/src/constants/strings';
import { FALLBACK_ATTENDANCE_STATUS_OPTIONS } from '@/src/constants/attendance';

import type { AttendanceEntries, MarkAttendanceEmployee } from '@/src/lib/types/attendance';

const employees: MarkAttendanceEmployee[] = [
  { id: 'clx-1', employeeId: 'EMP1001', name: 'Darlene Robertson', department: 'Design', shift: 'General' },
  { id: 'clx-2', employeeId: 'EMP1002', name: 'Floyd Miles', department: '', shift: null },
];

const entries: AttendanceEntries = {
  'clx-1': { status: 'PRESENT', overtimeHours: '1', overtimeMinutes: '30', remarks: 'Client call ran late' },
};

const baseProps = {
  employees,
  entries: {},
  onEntryChange: vi.fn(),
  statusOptions: FALLBACK_ATTENDANCE_STATUS_OPTIONS,
  search: '',
  onSearchChange: vi.fn(),
  pagination: { pageIndex: 0, pageSize: 10 },
  onPaginationChange: vi.fn(),
  totalItems: employees.length,
  onExport: vi.fn(),
  onSaveDraft: vi.fn(),
  onSubmit: vi.fn(),
};

/** The body row for the employee with `code`. */
const getRow = (code: string) => screen.getByText(code).closest('tr') as HTMLTableRowElement;

const hoursLabel = `${STRINGS.OVERTIME} ${STRINGS.OVERTIME_HOURS_PLACEHOLDER}`;
const minutesLabel = `${STRINGS.OVERTIME} ${STRINGS.OVERTIME_MINUTES_PLACEHOLDER}`;

describe('MarkAttendanceTable', () => {
  it('renders the sheet columns in order', () => {
    render(<MarkAttendanceTable {...baseProps} />);

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

  it('renders who is being marked, with dashes for missing department and shift', () => {
    render(<MarkAttendanceTable {...baseProps} />);

    const first = within(getRow('EMP1001')).getAllByRole('cell');
    expect(first[1]).toHaveTextContent('Darlene Robertson');
    expect(first[2]).toHaveTextContent('Design');
    expect(first[3]).toHaveTextContent('General');

    const second = within(getRow('EMP1002')).getAllByRole('cell');
    expect(second[2]).toHaveTextContent(STRINGS.NOT_AVAILABLE);
    expect(second[3]).toHaveTextContent(STRINGS.NOT_AVAILABLE);
  });

  it('shows an unmarked row with an empty status, overtime and remarks', () => {
    render(<MarkAttendanceTable {...baseProps} />);

    const row = within(getRow('EMP1001'));
    expect(row.getByText(STRINGS.SELECT_STATUS)).toBeInTheDocument();
    expect(row.getByLabelText(hoursLabel)).toHaveValue('');
    expect(row.getByLabelText(minutesLabel)).toHaveValue('');
    expect(row.getByLabelText(STRINGS.REMARKS)).toHaveValue('');
  });

  it('shows a marked row with its entry and tints the status cell', () => {
    render(<MarkAttendanceTable {...baseProps} entries={entries} />);

    const row = within(getRow('EMP1001'));
    expect(row.getByText(STRINGS.PRESENT)).toBeInTheDocument();
    expect(row.getByLabelText(hoursLabel)).toHaveValue('1');
    expect(row.getByLabelText(minutesLabel)).toHaveValue('30');
    expect(row.getByLabelText(STRINGS.REMARKS)).toHaveValue('Client call ran late');

    const statusCell = getRow('EMP1001').querySelector(`.${styles.statusCell}`);
    expect(statusCell).toHaveClass(styles.present);
  });

  it('reports a status pick as a patch keyed by the employee id', async () => {
    const user = userEvent.setup();
    const onEntryChange = vi.fn();
    render(<MarkAttendanceTable {...baseProps} onEntryChange={onEntryChange} />);

    const row = within(getRow('EMP1002'));
    await user.click(row.getByRole('button', { expanded: false }));
    await user.click(screen.getByRole('button', { name: STRINGS.ON_LEAVE }));

    expect(onEntryChange).toHaveBeenCalledWith('clx-2', { status: 'ON_LEAVE' });
  });

  it('reports overtime hours as typed, cleaned to the field rules', async () => {
    const user = userEvent.setup();
    const onEntryChange = vi.fn();
    render(<MarkAttendanceTable {...baseProps} onEntryChange={onEntryChange} />);

    await user.type(within(getRow('EMP1001')).getByLabelText(hoursLabel), '9');

    expect(onEntryChange).toHaveBeenCalledWith('clx-1', { overtimeHours: '9' });
  });

  it('caps overtime hours at 23 and minutes at 59', async () => {
    const user = userEvent.setup();
    const onEntryChange = vi.fn();
    render(<MarkAttendanceTable {...baseProps} onEntryChange={onEntryChange} />);

    const row = within(getRow('EMP1001'));
    await user.type(row.getByLabelText(hoursLabel), '99');
    expect(onEntryChange).toHaveBeenLastCalledWith('clx-1', { overtimeHours: '9' });

    await user.type(row.getByLabelText(minutesLabel), '7');
    expect(onEntryChange).toHaveBeenLastCalledWith('clx-1', { overtimeMinutes: '7' });
  });

  it('strips non-digits from the overtime fields', async () => {
    const user = userEvent.setup();
    const onEntryChange = vi.fn();
    render(<MarkAttendanceTable {...baseProps} onEntryChange={onEntryChange} />);

    await user.type(within(getRow('EMP1001')).getByLabelText(hoursLabel), 'a');

    expect(onEntryChange).toHaveBeenCalledWith('clx-1', { overtimeHours: '' });
  });

  it('reports remarks as typed', async () => {
    const user = userEvent.setup();
    const onEntryChange = vi.fn();
    render(<MarkAttendanceTable {...baseProps} onEntryChange={onEntryChange} />);

    await user.type(within(getRow('EMP1002')).getByLabelText(STRINGS.REMARKS), 'x');

    expect(onEntryChange).toHaveBeenCalledWith('clx-2', { remarks: 'x' });
  });

  it('keys an entry by the employee code when the record has no id', () => {
    const withoutId: MarkAttendanceEmployee[] = [{ id: '', employeeId: 'EMP2001', name: 'No Id', department: 'Ops' }];
    const byCode: AttendanceEntries = {
      EMP2001: { status: 'PRESENT', overtimeHours: '', overtimeMinutes: '', remarks: 'keyed by code' },
    };
    render(<MarkAttendanceTable {...baseProps} employees={withoutId} entries={byCode} totalItems={1} />);

    expect(within(getRow('EMP2001')).getByLabelText(STRINGS.REMARKS)).toHaveValue('keyed by code');
  });

  it('renders the search box without a filter trigger', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(<MarkAttendanceTable {...baseProps} onSearchChange={onSearchChange} />);

    expect(screen.queryByRole('button', { name: STRINGS.FILTER })).not.toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(STRINGS.SEARCH_EMPLOYEE_NAME_OR_ID), 'D');
    expect(onSearchChange).toHaveBeenCalledWith('D');
  });

  it('renders the footer actions and wires them up', async () => {
    const user = userEvent.setup();
    const onSaveDraft = vi.fn();
    const onSubmit = vi.fn();
    render(<MarkAttendanceTable {...baseProps} onSaveDraft={onSaveDraft} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: STRINGS.SAVE_AS_DRAFT }));
    expect(onSaveDraft).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: STRINGS.SUBMIT_ATTENDANCE }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('holds both actions while a draft is being saved', () => {
    render(<MarkAttendanceTable {...baseProps} isSavingDraft />);

    const buttons = screen.getAllByRole('button').filter((button) => button.closest(`.${styles.actions}`));
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
  });

  it('holds both actions while the day is being submitted', () => {
    render(<MarkAttendanceTable {...baseProps} isSubmitting />);

    const buttons = screen.getAllByRole('button').filter((button) => button.closest(`.${styles.actions}`));
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
  });

  it('shows the skeleton instead of rows while loading', () => {
    render(<MarkAttendanceTable {...baseProps} isLoading />);

    expect(screen.queryByText('EMP1001')).not.toBeInTheDocument();
  });

  it('shows the empty state when there is nobody to mark', () => {
    render(<MarkAttendanceTable {...baseProps} employees={[]} totalItems={0} />);

    expect(screen.getByText(STRINGS.NO_DATA_FOUND)).toBeInTheDocument();
  });

  it('pages on the server: page turns go to the parent', async () => {
    const user = userEvent.setup();
    const onPaginationChange = vi.fn();
    render(<MarkAttendanceTable {...baseProps} totalItems={42} onPaginationChange={onPaginationChange} />);

    await user.click(screen.getByRole('button', { name: 'Next page' }));

    expect(onPaginationChange).toHaveBeenCalledWith({ pageIndex: 1, pageSize: 10 });
  });
});
