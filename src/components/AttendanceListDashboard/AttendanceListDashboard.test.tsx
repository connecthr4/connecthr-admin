import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AttendanceListDashboard from './AttendanceListDashboard';
import { getAttendanceSheet } from '@/src/lib/actions/attendance';
import { AttendanceClient } from '@/src/lib/api/attendanceClient';
import { useToday } from '@/src/hooks/useToday';
import { logger } from '@/src/lib/logger';
import { ROLES } from '@/src/lib/auth/roles';
import { NOTIFICATION_TYPES, STRINGS } from '@/src/constants/strings';
import {
  ATTENDANCE_PAGE_SIZE,
  ATTENDANCE_SHEET_SORT_BY,
  ATTENDANCE_SHEET_SORT_ORDER,
  FALLBACK_ATTENDANCE_STATUS_OPTIONS,
} from '@/src/constants/attendance';

import type { PaginationState } from '@tanstack/react-table';
import type { User } from '@/src/lib/types/auth';
import type { AttendanceSheet, AttendanceSheetRow } from '@/src/lib/types/attendance';
import type { FilterOptions } from '@/src/lib/types/filters';
import type { FilterSelection } from '../FilterPopover';
import type { ExportScope } from '../ExportScopeOptions';

const TODAY = '2026-09-12';

vi.mock('@/src/lib/logger', () => ({
  logger: { trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn() },
}));

const showNotificationMock = vi.fn();

vi.mock('@/src/providers/NotificationProvider', () => ({
  useNotification: () => ({ showNotification: showNotificationMock }),
}));

vi.mock('@/src/hooks/useToday', () => ({
  useToday: vi.fn(() => TODAY),
}));

vi.mock('@/src/lib/actions/attendance', () => ({
  getAttendanceSheet: vi.fn(),
}));

vi.mock('@/src/lib/api/attendanceClient', () => ({
  AttendanceClient: { exportAttendance: vi.fn() },
}));

/*
The header chip renders `UserMenu` for real; only its Server Action dependency
is stubbed, since `src/lib/actions/auth` pulls in `server-only` and
`next/headers`, neither of which resolve under jsdom.
*/
vi.mock('@/src/lib/actions/auth', () => ({
  logoutAction: vi.fn(),
}));

/*
The date field is stubbed to two buttons: one that picks a fixed day and one
that clears the field. `DatePicker` has tests of its own.
*/
vi.mock('../DatePicker', () => ({
  default: ({ value, maxDate, onChange }: { value?: string; maxDate?: Date; onChange: (value: string) => void }) => (
    <div>
      <span>{`date:${value || 'none'}`}</span>
      <span>{`max:${maxDate ? maxDate.toISOString().slice(0, 10) : 'none'}`}</span>
      <button onClick={() => onChange('2026-09-10')}>pick-date</button>
      <button onClick={() => onChange('')}>clear-date</button>
    </div>
  ),
}));

/*
The table is stubbed to what the dashboard drives it with: the rows it was
given, its loading flag, and the callbacks it reports through.
*/
vi.mock('../AttendanceListTable', () => ({
  default: ({
    rows,
    search,
    onSearchChange,
    filterOptions,
    onFilterChange,
    pagination,
    onPaginationChange,
    totalItems,
    isLoading,
    children,
  }: {
    rows: AttendanceSheetRow[];
    search: string;
    onSearchChange: (value: string) => void;
    filterOptions?: FilterOptions;
    onFilterChange?: (selection: FilterSelection) => void;
    pagination: PaginationState;
    onPaginationChange: (pagination: PaginationState) => void;
    totalItems: number;
    isLoading?: boolean;
    children?: React.ReactNode;
  }) => (
    <div>
      <span>{isLoading ? 'table-loading' : 'table-loaded'}</span>
      <span>{`rows:${rows.map((row) => row.employeeCode).join(',') || 'none'}`}</span>
      <span>{`total:${totalItems}`}</span>
      <span>{`page:${pagination.pageIndex}`}</span>
      <span>{`filters:${(filterOptions ?? []).map((group) => `${group.id}(${group.options.length})`).join(',')}`}</span>
      <input aria-label="search" value={search} onChange={(event) => onSearchChange(event.target.value)} />
      <button onClick={() => onFilterChange?.({ departments: ['Design'], statuses: ['PRESENT'] })}>apply-filter</button>
      <button onClick={() => onFilterChange?.({})}>clear-filter</button>
      <button onClick={() => onPaginationChange({ ...pagination, pageIndex: pagination.pageIndex + 1 })}>
        next-page
      </button>
      {children}
    </div>
  ),
}));

vi.mock('../ExportConfirmationModal', () => ({
  default: ({
    isOpen,
    onClose,
    onConfirm,
    description,
    isExporting,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    description: string;
    isExporting?: boolean;
    children?: React.ReactNode;
  }) =>
    isOpen ? (
      <div>
        <span>{description}</span>
        <span>{isExporting ? 'exporting' : 'export-idle'}</span>
        {children}
        <button onClick={onConfirm}>mock-confirm-export</button>
        <button onClick={onClose}>mock-cancel-export</button>
      </div>
    ) : null,
}));

vi.mock('../ExportScopeOptions', () => ({
  default: ({
    value,
    onChange,
    disabled,
  }: {
    value: ExportScope;
    onChange: (scope: ExportScope) => void;
    disabled?: boolean;
  }) => (
    <div>
      <span>{`scope:${value}`}</span>
      <button disabled={disabled} onClick={() => onChange('filtered')}>
        choose-filtered
      </button>
    </div>
  ),
}));

const currentUser: User = {
  id: 'clx-current',
  name: 'Jane Doe',
  email: 'jane@example.com',
  role: ROLES.ADMIN,
  status: 'ACTIVE',
  mustChangePassword: false,
};

const departments = [
  { label: 'Design', value: 'Design' },
  { label: 'Sales', value: 'Sales' },
];

const row = (code: string): AttendanceSheetRow => ({
  employeeId: `id-${code}`,
  employeeCode: code,
  name: code,
  department: 'Design',
  shiftCode: 'GEN',
  shift: 'General',
  status: 'PRESENT',
  statusLabel: 'Present',
  overtime: { hours: 0, minutes: 0, totalMinutes: 0, label: '0h 00m' },
  remarks: null,
  state: 'SUBMITTED',
});

function sheet(rows: AttendanceSheetRow[], totalItems = rows.length): AttendanceSheet {
  return {
    date: TODAY,
    state: 'SUBMITTED',
    summary: { totalEmployees: 40, present: 30, absent: 0, halfDay: 4, onLeave: 6, notMarked: 0 },
    rows,
    meta: {
      currentPage: 1,
      pageSize: ATTENDANCE_PAGE_SIZE,
      totalItems,
      totalPages: Math.ceil(totalItems / ATTENDANCE_PAGE_SIZE),
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
}

const baseRequest = {
  date: TODAY,
  page: 1,
  limit: ATTENDANCE_PAGE_SIZE,
  sortBy: ATTENDANCE_SHEET_SORT_BY,
  sortOrder: ATTENDANCE_SHEET_SORT_ORDER,
};

const errorNotification = (title: string, message: string) => [
  title,
  message,
  NOTIFICATION_TYPES.ERROR,
  5000,
  'top-right',
  false,
];

function renderDashboard(props: Partial<React.ComponentProps<typeof AttendanceListDashboard>> = {}) {
  return render(<AttendanceListDashboard currentUser={currentUser} departments={departments} {...props} />);
}

describe('AttendanceListDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useToday).mockReturnValue(TODAY);
    vi.mocked(getAttendanceSheet).mockResolvedValue({ success: true, data: sheet([row('EMP1001'), row('EMP1002')]) });
  });

  it('renders the header with the listing title, subtitle and signed-in user', () => {
    renderDashboard();

    expect(screen.getByText(STRINGS.ATTENDANCE_LIST)).toBeInTheDocument();
    expect(screen.getByText(STRINGS.ATTENDANCE_LIST_SUBTITLE)).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('opens on today, capped at today, and reads the day unnarrowed', async () => {
    renderDashboard();

    expect(screen.getByText(`date:${TODAY}`)).toBeInTheDocument();
    expect(screen.getByText(`max:${TODAY}`)).toBeInTheDocument();

    await waitFor(() => expect(getAttendanceSheet).toHaveBeenCalledTimes(1));
    expect(getAttendanceSheet).toHaveBeenCalledWith(baseRequest);
  });

  it('shows the skeleton and blank counts until the day has loaded, then the rows and head count', async () => {
    renderDashboard();

    expect(screen.getByText('table-loading')).toBeInTheDocument();
    expect(screen.getAllByText(STRINGS.NOT_AVAILABLE)).toHaveLength(4);

    expect(await screen.findByText('rows:EMP1001,EMP1002')).toBeInTheDocument();
    expect(screen.getByText('table-loaded')).toBeInTheDocument();
    expect(screen.getByText('total:2')).toBeInTheDocument();

    expect(screen.getByText(STRINGS.TOTAL_EMPLOYEES)).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText(STRINGS.PRESENT)).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText(STRINGS.ON_LEAVE)).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText(STRINGS.HALF_DAY)).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('does not read anything until the client knows what today is', () => {
    vi.mocked(useToday).mockReturnValue('');
    renderDashboard();

    expect(getAttendanceSheet).not.toHaveBeenCalled();
    expect(screen.getByText('table-loading')).toBeInTheDocument();
    expect(screen.getByText('date:none')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: STRINGS.EXPORT })).toBeDisabled();
  });

  it('offers department and status filter groups, falling back to the default statuses', () => {
    renderDashboard();

    expect(
      screen.getByText(`filters:departments(2),statuses(${FALLBACK_ATTENDANCE_STATUS_OPTIONS.length})`)
    ).toBeInTheDocument();
  });

  it('drops the department group when no departments were offered, and uses the statuses given', () => {
    renderDashboard({ departments: [], statuses: [{ label: 'Present', value: 'PRESENT' }] });

    expect(screen.getByText('filters:statuses(1)')).toBeInTheDocument();
  });

  it('re-reads the chosen day from its first page when a date is picked', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitFor(() => expect(getAttendanceSheet).toHaveBeenCalledTimes(1));

    await user.click(screen.getByText('next-page'));
    await waitFor(() => expect(getAttendanceSheet).toHaveBeenLastCalledWith({ ...baseRequest, page: 2 }));

    await user.click(screen.getByText('pick-date'));

    await waitFor(() => expect(getAttendanceSheet).toHaveBeenLastCalledWith({ ...baseRequest, date: '2026-09-10' }));
    expect(screen.getByText('date:2026-09-10')).toBeInTheDocument();
    expect(screen.getByText('page:0')).toBeInTheDocument();
  });

  it('falls back to today when the date is cleared', async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(screen.getByText('pick-date'));
    await waitFor(() => expect(getAttendanceSheet).toHaveBeenLastCalledWith({ ...baseRequest, date: '2026-09-10' }));

    await user.click(screen.getByText('clear-date'));

    await waitFor(() => expect(getAttendanceSheet).toHaveBeenLastCalledWith(baseRequest));
    expect(screen.getByText(`date:${TODAY}`)).toBeInTheDocument();
  });

  it('narrows the read to the applied filter selection', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitFor(() => expect(getAttendanceSheet).toHaveBeenCalledTimes(1));

    await user.click(screen.getByText('apply-filter'));

    await waitFor(() =>
      expect(getAttendanceSheet).toHaveBeenLastCalledWith({
        ...baseRequest,
        departments: ['Design'],
        statuses: ['PRESENT'],
      })
    );

    await user.click(screen.getByText('clear-filter'));

    await waitFor(() => expect(getAttendanceSheet).toHaveBeenCalledTimes(3));
    expect(getAttendanceSheet).toHaveBeenLastCalledWith(baseRequest);
  });

  it('searches once typing settles, from the first page', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitFor(() => expect(getAttendanceSheet).toHaveBeenCalledTimes(1));

    await user.type(screen.getByLabelText('search'), 'Dar');

    await waitFor(() => expect(getAttendanceSheet).toHaveBeenLastCalledWith({ ...baseRequest, search: 'Dar' }));
    expect(getAttendanceSheet).toHaveBeenCalledTimes(2);
  });

  it('reads the next page when the table pages, showing the skeleton until it lands', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitFor(() => expect(getAttendanceSheet).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('table-loaded')).toBeInTheDocument();

    let resolveNext!: (value: { success: true; data: AttendanceSheet }) => void;
    vi.mocked(getAttendanceSheet).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveNext = resolve;
        })
    );

    await user.click(screen.getByText('next-page'));

    expect(screen.getByText('table-loading')).toBeInTheDocument();
    expect(getAttendanceSheet).toHaveBeenLastCalledWith({ ...baseRequest, page: 2 });

    resolveNext({ success: true, data: sheet([row('EMP1011')]) });

    expect(await screen.findByText('rows:EMP1011')).toBeInTheDocument();
    expect(screen.getByText('table-loaded')).toBeInTheDocument();
  });

  it('discards a response that a newer request has overtaken', async () => {
    const user = userEvent.setup();
    let resolveFirst!: (value: { success: true; data: AttendanceSheet }) => void;
    vi.mocked(getAttendanceSheet)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          })
      )
      .mockResolvedValueOnce({ success: true, data: sheet([row('NEWER')]) });

    renderDashboard();
    await waitFor(() => expect(getAttendanceSheet).toHaveBeenCalledTimes(1));

    await user.click(screen.getByText('next-page'));
    expect(await screen.findByText('rows:NEWER')).toBeInTheDocument();

    resolveFirst({ success: true, data: sheet([row('STALE')]) });

    await waitFor(() => expect(screen.getByText('rows:NEWER')).toBeInTheDocument());
    expect(screen.queryByText('rows:STALE')).not.toBeInTheDocument();
  });

  it('reports a failed read and still ends the loading state', async () => {
    vi.mocked(getAttendanceSheet).mockResolvedValue({ success: false, message: 'Sheet unavailable' });
    renderDashboard();

    await waitFor(() =>
      expect(showNotificationMock).toHaveBeenCalledWith(
        ...errorNotification(STRINGS.ATTENDANCE_FETCH_FAILED, 'Sheet unavailable')
      )
    );
    expect(screen.getByText('table-loaded')).toBeInTheDocument();
    expect(screen.getByText('rows:none')).toBeInTheDocument();
  });

  it('logs and reports an unexpected error from the read', async () => {
    vi.mocked(getAttendanceSheet).mockRejectedValue(new Error('boom'));
    renderDashboard();

    await waitFor(() =>
      expect(showNotificationMock).toHaveBeenCalledWith(...errorNotification(STRINGS.ATTENDANCE_FETCH_FAILED, ''))
    );
    expect(logger.error).toHaveBeenCalled();
    expect(screen.getByText('table-loaded')).toBeInTheDocument();
  });

  describe('export', () => {
    it('opens the confirmation modal on "all" without downloading anything yet', async () => {
      const user = userEvent.setup();
      renderDashboard();

      expect(screen.queryByText('mock-confirm-export')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: STRINGS.EXPORT }));

      expect(screen.getByText(STRINGS.EXPORT_ATTENDANCE_CONFIRMATION)).toBeInTheDocument();
      expect(screen.getByText('scope:all')).toBeInTheDocument();
      expect(AttendanceClient.exportAttendance).not.toHaveBeenCalled();
    });

    it('closes without downloading when cancelled', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: STRINGS.EXPORT }));
      await user.click(screen.getByText('mock-cancel-export'));

      expect(screen.queryByText('mock-confirm-export')).not.toBeInTheDocument();
      expect(AttendanceClient.exportAttendance).not.toHaveBeenCalled();
    });

    it('exports the whole day with only the date and sort, then confirms and closes', async () => {
      const user = userEvent.setup();
      vi.mocked(AttendanceClient.exportAttendance).mockResolvedValue(undefined);
      renderDashboard();

      await user.click(screen.getByText('apply-filter'));
      await user.click(screen.getByRole('button', { name: STRINGS.EXPORT }));
      await user.click(screen.getByText('mock-confirm-export'));

      expect(AttendanceClient.exportAttendance).toHaveBeenCalledWith({
        scope: 'all',
        date: TODAY,
        sortBy: ATTENDANCE_SHEET_SORT_BY,
        sortOrder: ATTENDANCE_SHEET_SORT_ORDER,
      });
      await waitFor(() => expect(screen.queryByText('mock-confirm-export')).not.toBeInTheDocument());
      expect(showNotificationMock).toHaveBeenCalledWith(
        STRINGS.ATTENDANCE_EXPORTED_SUCCESSFULLY,
        '',
        NOTIFICATION_TYPES.SUCCESS,
        5000,
        'top-right',
        false
      );
    });

    it('repeats the listing’s narrowing on a "filtered" export', async () => {
      const user = userEvent.setup();
      vi.mocked(AttendanceClient.exportAttendance).mockResolvedValue(undefined);
      renderDashboard();

      await user.click(screen.getByText('apply-filter'));
      await user.type(screen.getByLabelText('search'), 'Dar');
      await waitFor(() =>
        expect(getAttendanceSheet).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'Dar' }))
      );

      await user.click(screen.getByRole('button', { name: STRINGS.EXPORT }));
      await user.click(screen.getByText('choose-filtered'));
      expect(screen.getByText('scope:filtered')).toBeInTheDocument();

      await user.click(screen.getByText('mock-confirm-export'));

      expect(AttendanceClient.exportAttendance).toHaveBeenCalledWith({
        scope: 'filtered',
        date: TODAY,
        sortBy: ATTENDANCE_SHEET_SORT_BY,
        sortOrder: ATTENDANCE_SHEET_SORT_ORDER,
        search: 'Dar',
        departments: ['Design'],
        statuses: ['PRESENT'],
      });
    });

    it('resets the scope to "all" every time the modal is opened', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: STRINGS.EXPORT }));
      await user.click(screen.getByText('choose-filtered'));
      await user.click(screen.getByText('mock-cancel-export'));

      await user.click(screen.getByRole('button', { name: STRINGS.EXPORT }));

      expect(screen.getByText('scope:all')).toBeInTheDocument();
    });

    it('shows the exporting state while the download is in flight', async () => {
      const user = userEvent.setup();
      let resolveExport!: () => void;
      vi.mocked(AttendanceClient.exportAttendance).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveExport = () => resolve(undefined);
          })
      );
      renderDashboard();

      await user.click(screen.getByRole('button', { name: STRINGS.EXPORT }));
      expect(screen.getByText('export-idle')).toBeInTheDocument();

      await user.click(screen.getByText('mock-confirm-export'));
      expect(await screen.findByText('exporting')).toBeInTheDocument();
      expect(screen.getByText('choose-filtered')).toBeDisabled();

      resolveExport();
      await waitFor(() => expect(screen.queryByText('mock-confirm-export')).not.toBeInTheDocument());
    });

    it('reports a failed export and keeps the modal open', async () => {
      const user = userEvent.setup();
      const error = new Error('failed') as Error & { details?: unknown };
      error.details = { message: 'Export unavailable', success: false };
      vi.mocked(AttendanceClient.exportAttendance).mockRejectedValue(error);
      renderDashboard();

      await user.click(screen.getByRole('button', { name: STRINGS.EXPORT }));
      await user.click(screen.getByText('mock-confirm-export'));

      await waitFor(() =>
        expect(showNotificationMock).toHaveBeenCalledWith(
          ...errorNotification(STRINGS.ATTENDANCE_EXPORT_FAILED, 'Export unavailable')
        )
      );
      expect(logger.error).toHaveBeenCalled();
      expect(screen.getByText('mock-confirm-export')).toBeInTheDocument();
      expect(screen.getByText('export-idle')).toBeInTheDocument();
    });
  });
});
