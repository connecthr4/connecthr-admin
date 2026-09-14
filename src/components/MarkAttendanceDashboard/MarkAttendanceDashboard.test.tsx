import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import MarkAttendanceDashboard from './MarkAttendanceDashboard';
import { getAttendanceSheet, saveAttendanceDraft, submitAttendance } from '@/src/lib/actions/attendance';
import { triggerFileDownload } from '@/src/utils/download';
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
import type {
  AttendanceEntries,
  AttendanceEntry,
  AttendanceSheet,
  AttendanceSheetRow,
  AttendanceStatusOption,
  MarkAttendanceEmployee,
} from '@/src/lib/types/attendance';
import type { DropdownOption } from '../Dropdown/Dropdown';

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
  saveAttendanceDraft: vi.fn(),
  submitAttendance: vi.fn(),
}));

vi.mock('@/src/utils/download', () => ({
  triggerFileDownload: vi.fn(),
}));

/*
The header chip renders `UserMenu` for real; only its Server Action dependency
is stubbed, since `src/lib/actions/auth` pulls in `server-only` and
`next/headers`, neither of which resolve under jsdom.
*/
vi.mock('@/src/lib/actions/auth', () => ({
  logoutAction: vi.fn(),
}));

vi.mock('../DatePicker', () => ({
  default: ({ value, onChange }: { value?: string; onChange: (value: string) => void }) => (
    <div>
      <span>{`date:${value || 'none'}`}</span>
      <button onClick={() => onChange('2026-09-10')}>pick-date</button>
    </div>
  ),
}));

/* A native select stands in for the app's dropdown, so a pick is one event. */
vi.mock('../Dropdown', () => ({
  default: ({
    label,
    options,
    value,
    onChange,
  }: {
    label: string;
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
  }) => (
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

/*
The sheet is stubbed to what the dashboard drives it with: the rows and
entries it was given, its flags, and the callbacks it reports through.
*/
vi.mock('../MarkAttendanceTable', () => ({
  default: ({
    employees,
    entries,
    onEntryChange,
    statusOptions,
    search,
    onSearchChange,
    pagination,
    onPaginationChange,
    totalItems,
    isLoading,
    isSavingDraft,
    isSubmitting,
    onExport,
    onSaveDraft,
    onSubmit,
  }: {
    employees: MarkAttendanceEmployee[];
    entries: AttendanceEntries;
    onEntryChange: (employeeId: string, patch: Partial<AttendanceEntry>) => void;
    statusOptions: AttendanceStatusOption[];
    search: string;
    onSearchChange: (value: string) => void;
    pagination: PaginationState;
    onPaginationChange: (pagination: PaginationState) => void;
    totalItems: number;
    isLoading?: boolean;
    isSavingDraft?: boolean;
    isSubmitting?: boolean;
    onExport: () => void;
    onSaveDraft: () => void;
    onSubmit: () => void;
  }) => (
    <div>
      <span>{isLoading ? 'table-loading' : 'table-loaded'}</span>
      <span>{`rows:${employees.map((employee) => employee.employeeId).join(',') || 'none'}`}</span>
      <span>{`marked:${
        Object.entries(entries)
          .map(([key, entry]) => `${key}=${entry.status}`)
          .join(',') || 'none'
      }`}</span>
      <span>{`statuses:${statusOptions.length}`}</span>
      <span>{`total:${totalItems}`}</span>
      <span>{`page:${pagination.pageIndex}`}</span>
      <span>{`busy:${isSavingDraft ? 'draft' : isSubmitting ? 'submit' : 'none'}`}</span>
      <input aria-label="search" value={search} onChange={(event) => onSearchChange(event.target.value)} />
      {employees.map((employee) => (
        <button key={employee.id} onClick={() => onEntryChange(employee.id, { status: 'PRESENT' })}>
          {`mark-${employee.employeeId}`}
        </button>
      ))}
      <button onClick={() => onPaginationChange({ ...pagination, pageIndex: pagination.pageIndex + 1 })}>
        next-page
      </button>
      <button onClick={onExport}>mock-export</button>
      <button onClick={onSaveDraft}>mock-save-draft</button>
      <button onClick={onSubmit}>mock-submit</button>
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

const departments: DropdownOption[] = [
  { label: 'Design', value: 'Design' },
  { label: 'Sales', value: 'Sales' },
];

const shifts: DropdownOption[] = [
  { label: 'General', value: 'GEN' },
  { label: 'Night', value: 'NGT' },
];

const row = (code: string, status: string | null = null): AttendanceSheetRow => ({
  employeeId: `id-${code}`,
  employeeCode: code,
  name: code,
  department: 'Design',
  shiftCode: 'GEN',
  shift: 'General',
  status,
  statusLabel: status,
  overtime: { hours: 0, minutes: 0, totalMinutes: 0, label: '0h 00m' },
  remarks: null,
  state: status ? 'DRAFT' : null,
});

function sheet(rows: AttendanceSheetRow[], totalItems = rows.length): AttendanceSheet {
  return {
    date: TODAY,
    state: 'DRAFT',
    summary: { totalEmployees: totalItems, present: 0, absent: 0, halfDay: 0, onLeave: 0, notMarked: totalItems },
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

const notification = (title: string, message: string, type: string) => [title, message, type, 5000, 'top-right', false];

function renderDashboard(props: Partial<React.ComponentProps<typeof MarkAttendanceDashboard>> = {}) {
  return render(
    <MarkAttendanceDashboard currentUser={currentUser} departments={departments} shifts={shifts} {...props} />
  );
}

/** Renders, waits for the opening read, and marks the first two rows present. */
async function renderMarked(user: ReturnType<typeof userEvent.setup>) {
  renderDashboard();
  expect(await screen.findByText('rows:EMP1001,EMP1002')).toBeInTheDocument();

  await user.click(screen.getByText('mark-EMP1001'));
  await user.click(screen.getByText('mark-EMP1002'));
}

describe('MarkAttendanceDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useToday).mockReturnValue(TODAY);
    vi.mocked(getAttendanceSheet).mockResolvedValue({ success: true, data: sheet([row('EMP1001'), row('EMP1002')]) });
  });

  it('renders the header with the marking title, subtitle and signed-in user', () => {
    renderDashboard();

    expect(screen.getByText(STRINGS.MARK_ATTENDANCE)).toBeInTheDocument();
    expect(screen.getByText(STRINGS.MARK_ATTENDANCE_SUBTITLE)).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('opens on today across every department and shift, and reads that sheet', async () => {
    renderDashboard();

    expect(screen.getByText(`date:${TODAY}`)).toBeInTheDocument();
    expect(screen.getByLabelText(STRINGS.DEPARTMENT)).toHaveValue('all');
    expect(screen.getByLabelText(STRINGS.SHIFT)).toHaveValue('all');

    await waitFor(() => expect(getAttendanceSheet).toHaveBeenCalledTimes(1));
    expect(getAttendanceSheet).toHaveBeenCalledWith(baseRequest);
    expect(await screen.findByText('rows:EMP1001,EMP1002')).toBeInTheDocument();
    expect(screen.getByText('table-loaded')).toBeInTheDocument();
  });

  it('does not read anything until the client knows what today is', () => {
    vi.mocked(useToday).mockReturnValue('');
    renderDashboard();

    expect(getAttendanceSheet).not.toHaveBeenCalled();
    expect(screen.getByText('table-loading')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: STRINGS.VIEW })).toBeDisabled();
  });

  it('prefixes the department and shift dropdowns with an "All" option', () => {
    renderDashboard();

    const departmentOptions = Array.from((screen.getByLabelText(STRINGS.DEPARTMENT) as HTMLSelectElement).options);
    expect(departmentOptions.map((option) => option.textContent)).toEqual([STRINGS.ALL_DEPARTMENTS, 'Design', 'Sales']);

    const shiftOptions = Array.from((screen.getByLabelText(STRINGS.SHIFT) as HTMLSelectElement).options);
    expect(shiftOptions.map((option) => option.textContent)).toEqual([STRINGS.ALL_SHIFTS, 'General', 'Night']);
  });

  it('falls back to the default statuses when none were offered', () => {
    const { unmount } = renderDashboard();
    expect(screen.getByText(`statuses:${FALLBACK_ATTENDANCE_STATUS_OPTIONS.length}`)).toBeInTheDocument();
    unmount();

    renderDashboard({ statuses: [{ label: 'Present', value: 'PRESENT' }] });
    expect(screen.getByText('statuses:1')).toBeInTheDocument();
  });

  it('seeds the entries from rows the backend already has marked', async () => {
    vi.mocked(getAttendanceSheet).mockResolvedValue({
      success: true,
      data: sheet([row('EMP1001', 'PRESENT'), row('EMP1002')]),
    });
    renderDashboard();

    expect(await screen.findByText('marked:id-EMP1001=PRESENT')).toBeInTheDocument();
  });

  it('only re-reads the day when View is pressed, narrowed to the chosen scope', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitFor(() => expect(getAttendanceSheet).toHaveBeenCalledTimes(1));

    await user.click(screen.getByText('pick-date'));
    await user.selectOptions(screen.getByLabelText(STRINGS.DEPARTMENT), 'Design');
    await user.selectOptions(screen.getByLabelText(STRINGS.SHIFT), 'NGT');

    expect(getAttendanceSheet).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: STRINGS.VIEW }));

    await waitFor(() =>
      expect(getAttendanceSheet).toHaveBeenLastCalledWith({
        ...baseRequest,
        date: '2026-09-10',
        departments: ['Design'],
        shiftCodes: ['NGT'],
      })
    );
  });

  it('re-reads the same scope when View is pressed again', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitFor(() => expect(getAttendanceSheet).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole('button', { name: STRINGS.VIEW }));

    await waitFor(() => expect(getAttendanceSheet).toHaveBeenCalledTimes(2));
  });

  it('clears markings, search and page when the scope moves', async () => {
    const user = userEvent.setup();
    await renderMarked(user);
    expect(screen.getByText('marked:id-EMP1001=PRESENT,id-EMP1002=PRESENT')).toBeInTheDocument();

    await user.type(screen.getByLabelText('search'), 'x');
    await user.click(screen.getByText('next-page'));
    expect(screen.getByText('page:1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: STRINGS.VIEW }));

    expect(screen.getByText('marked:none')).toBeInTheDocument();
    expect(screen.getByLabelText('search')).toHaveValue('');
    expect(screen.getByText('page:0')).toBeInTheDocument();
  });

  it('goes back to today across every department on Reset', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitFor(() => expect(getAttendanceSheet).toHaveBeenCalledTimes(1));

    await user.click(screen.getByText('pick-date'));
    await user.selectOptions(screen.getByLabelText(STRINGS.DEPARTMENT), 'Sales');
    await user.click(screen.getByRole('button', { name: STRINGS.VIEW }));
    await waitFor(() => expect(getAttendanceSheet).toHaveBeenCalledTimes(2));

    await user.click(screen.getByRole('button', { name: STRINGS.RESET }));

    expect(screen.getByText(`date:${TODAY}`)).toBeInTheDocument();
    expect(screen.getByLabelText(STRINGS.DEPARTMENT)).toHaveValue('all');
    await waitFor(() => expect(getAttendanceSheet).toHaveBeenLastCalledWith(baseRequest));
  });

  it('searches once typing settles, from the first page', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitFor(() => expect(getAttendanceSheet).toHaveBeenCalledTimes(1));

    await user.type(screen.getByLabelText('search'), 'Dar');

    await waitFor(() => expect(getAttendanceSheet).toHaveBeenLastCalledWith({ ...baseRequest, search: 'Dar' }));
    expect(getAttendanceSheet).toHaveBeenCalledTimes(2);
  });

  it('reads the next page when the sheet pages, keeping the markings', async () => {
    const user = userEvent.setup();
    await renderMarked(user);

    vi.mocked(getAttendanceSheet).mockResolvedValueOnce({ success: true, data: sheet([row('EMP1011')], 11) });
    await user.click(screen.getByText('next-page'));

    await waitFor(() => expect(getAttendanceSheet).toHaveBeenLastCalledWith({ ...baseRequest, page: 2 }));
    expect(await screen.findByText('rows:EMP1011')).toBeInTheDocument();
    expect(screen.getByText('marked:id-EMP1001=PRESENT,id-EMP1002=PRESENT')).toBeInTheDocument();
  });

  it('reports a failed read and still ends the loading state', async () => {
    vi.mocked(getAttendanceSheet).mockResolvedValue({ success: false, message: 'Sheet unavailable' });
    renderDashboard();

    await waitFor(() =>
      expect(showNotificationMock).toHaveBeenCalledWith(
        ...notification(STRINGS.ATTENDANCE_FETCH_FAILED, 'Sheet unavailable', NOTIFICATION_TYPES.ERROR)
      )
    );
    expect(screen.getByText('table-loaded')).toBeInTheDocument();
  });

  it('logs and reports an unexpected error from the read', async () => {
    vi.mocked(getAttendanceSheet).mockRejectedValue(new Error('boom'));
    renderDashboard();

    await waitFor(() =>
      expect(showNotificationMock).toHaveBeenCalledWith(
        ...notification(STRINGS.ATTENDANCE_FETCH_FAILED, '', NOTIFICATION_TYPES.ERROR)
      )
    );
    expect(logger.error).toHaveBeenCalled();
  });

  describe('saving a draft', () => {
    it('refuses to save when nothing has been marked', async () => {
      const user = userEvent.setup();
      renderDashboard();
      await screen.findByText('rows:EMP1001,EMP1002');

      await user.click(screen.getByText('mock-save-draft'));

      expect(saveAttendanceDraft).not.toHaveBeenCalled();
      expect(showNotificationMock).toHaveBeenCalledWith(
        ...notification(STRINGS.ATTENDANCE_NOTHING_TO_MARK, '', NOTIFICATION_TYPES.WARNING)
      );
    });

    it('posts the marked records for the day and confirms with the backend’s message', async () => {
      const user = userEvent.setup();
      vi.mocked(saveAttendanceDraft).mockResolvedValue({ success: true, message: 'Attendance saved as draft.' });
      await renderMarked(user);

      await user.click(screen.getByText('mock-save-draft'));

      expect(saveAttendanceDraft).toHaveBeenCalledWith({
        date: TODAY,
        records: [
          { employeeId: 'id-EMP1001', status: 'PRESENT', overtime: { hours: 0, minutes: 0 }, remarks: '' },
          { employeeId: 'id-EMP1002', status: 'PRESENT', overtime: { hours: 0, minutes: 0 }, remarks: '' },
        ],
      });
      await waitFor(() =>
        expect(showNotificationMock).toHaveBeenCalledWith(
          ...notification(STRINGS.ATTENDANCE_DRAFT_SAVED, 'Attendance saved as draft.', NOTIFICATION_TYPES.SUCCESS)
        )
      );
      /* A draft does not re-read the day. */
      expect(getAttendanceSheet).toHaveBeenCalledTimes(1);
    });

    it('holds the footer under the draft flag while the request is in flight', async () => {
      const user = userEvent.setup();
      let resolveSave!: (value: { success: boolean; message: string }) => void;
      vi.mocked(saveAttendanceDraft).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveSave = resolve;
          })
      );
      await renderMarked(user);

      await user.click(screen.getByText('mock-save-draft'));
      expect(await screen.findByText('busy:draft')).toBeInTheDocument();

      /* A second press while busy must not write the day twice. */
      await user.click(screen.getByText('mock-submit'));
      expect(submitAttendance).not.toHaveBeenCalled();

      resolveSave({ success: true, message: 'ok' });
      expect(await screen.findByText('busy:none')).toBeInTheDocument();
    });

    it('reports a refused draft with the backend’s wording', async () => {
      const user = userEvent.setup();
      vi.mocked(saveAttendanceDraft).mockResolvedValue({ success: false, message: 'Day is locked' });
      await renderMarked(user);

      await user.click(screen.getByText('mock-save-draft'));

      await waitFor(() =>
        expect(showNotificationMock).toHaveBeenCalledWith(
          ...notification(STRINGS.ATTENDANCE_DRAFT_SAVE_FAILED, 'Day is locked', NOTIFICATION_TYPES.ERROR)
        )
      );
    });

    it('logs and reports an unexpected error while saving', async () => {
      const user = userEvent.setup();
      vi.mocked(saveAttendanceDraft).mockRejectedValue(new Error('boom'));
      await renderMarked(user);

      await user.click(screen.getByText('mock-save-draft'));

      await waitFor(() =>
        expect(showNotificationMock).toHaveBeenCalledWith(
          ...notification(STRINGS.ATTENDANCE_DRAFT_SAVE_FAILED, '', NOTIFICATION_TYPES.ERROR)
        )
      );
      expect(logger.error).toHaveBeenCalled();
      expect(screen.getByText('busy:none')).toBeInTheDocument();
    });
  });

  describe('submitting the day', () => {
    it('refuses an incomplete day and says how many are still unmarked', async () => {
      const user = userEvent.setup();
      vi.mocked(getAttendanceSheet).mockResolvedValue({
        success: true,
        data: sheet([row('EMP1001'), row('EMP1002')], 5),
      });
      await renderMarked(user);

      await user.click(screen.getByText('mock-submit'));

      expect(submitAttendance).not.toHaveBeenCalled();
      expect(showNotificationMock).toHaveBeenCalledWith(
        ...notification(
          STRINGS.ATTENDANCE_INCOMPLETE,
          `3 of 5 ${STRINGS.ATTENDANCE_UNMARKED_MESSAGE}`,
          NOTIFICATION_TYPES.WARNING
        )
      );
    });

    it('submits a complete day, confirms, and re-reads the sheet', async () => {
      const user = userEvent.setup();
      vi.mocked(submitAttendance).mockResolvedValue({ success: true, message: 'Attendance submitted.' });
      await renderMarked(user);

      await user.click(screen.getByText('mock-submit'));

      expect(submitAttendance).toHaveBeenCalledWith(
        expect.objectContaining({ date: TODAY, records: expect.arrayContaining([expect.anything()]) })
      );
      await waitFor(() =>
        expect(showNotificationMock).toHaveBeenCalledWith(
          ...notification(STRINGS.ATTENDANCE_SUBMITTED, 'Attendance submitted.', NOTIFICATION_TYPES.SUCCESS)
        )
      );
      await waitFor(() => expect(getAttendanceSheet).toHaveBeenCalledTimes(2));
    });

    it('holds the footer under the submit flag while the request is in flight', async () => {
      const user = userEvent.setup();
      let resolveSubmit!: (value: { success: boolean; message: string }) => void;
      vi.mocked(submitAttendance).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveSubmit = resolve;
          })
      );
      await renderMarked(user);

      await user.click(screen.getByText('mock-submit'));
      expect(await screen.findByText('busy:submit')).toBeInTheDocument();

      resolveSubmit({ success: true, message: 'ok' });
      expect(await screen.findByText('busy:none')).toBeInTheDocument();
    });

    it('reports a refused submission without re-reading the sheet', async () => {
      const user = userEvent.setup();
      vi.mocked(submitAttendance).mockResolvedValue({ success: false, message: 'Already submitted' });
      await renderMarked(user);

      await user.click(screen.getByText('mock-submit'));

      await waitFor(() =>
        expect(showNotificationMock).toHaveBeenCalledWith(
          ...notification(STRINGS.ATTENDANCE_SUBMIT_FAILED, 'Already submitted', NOTIFICATION_TYPES.ERROR)
        )
      );
      expect(getAttendanceSheet).toHaveBeenCalledTimes(1);
    });
  });

  describe('export', () => {
    it('warns when there is nothing on screen to export', async () => {
      const user = userEvent.setup();
      vi.mocked(getAttendanceSheet).mockResolvedValue({ success: true, data: sheet([]) });
      renderDashboard();
      await screen.findByText('rows:none');

      await user.click(screen.getByText('mock-export'));

      expect(triggerFileDownload).not.toHaveBeenCalled();
      expect(showNotificationMock).toHaveBeenCalledWith(
        ...notification(STRINGS.NO_DATA_FOUND, '', NOTIFICATION_TYPES.WARNING)
      );
    });

    it('downloads the page on screen as a CSV named for the day', async () => {
      const user = userEvent.setup();
      await renderMarked(user);

      await user.click(screen.getByText('mock-export'));

      expect(triggerFileDownload).toHaveBeenCalledTimes(1);
      const [blob, filename] = vi.mocked(triggerFileDownload).mock.calls[0];
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/csv;charset=utf-8;');
      expect(filename).toBe(`attendance-${TODAY}.csv`);

      const csv = await blob.text();
      expect(csv).toContain('EMP1001');
      expect(csv).toContain('EMP1002');

      expect(showNotificationMock).toHaveBeenCalledWith(
        ...notification(STRINGS.ATTENDANCE_EXPORTED_SUCCESSFULLY, '', NOTIFICATION_TYPES.SUCCESS)
      );
    });
  });
});
