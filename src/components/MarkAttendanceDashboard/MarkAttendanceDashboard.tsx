/**
 * The screen an admin uses to mark a day's attendance: the day and department
 * being marked, and the employees that scope covers.
 *
 * @example
 * ```tsx
 * import MarkAttendanceDashboard from '@src/components/MarkAttendanceDashboard'
 *
 * export default function Page() {
 *   return <MarkAttendanceDashboard currentUser={currentUser} departments={departments} />;
 * }
 * ```
 */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AppHeader from '../AppHeader';
import Button from '../Button';
import DatePicker from '../DatePicker';
import Dropdown from '../Dropdown';
import MarkAttendanceTable from '../MarkAttendanceTable';
import { useToday } from '@/src/hooks/useToday';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useNotification } from '@/src/providers/NotificationProvider';
import { getAttendanceSheet, saveAttendanceDraft, submitAttendance } from '@/src/lib/actions/attendance';
import { logger } from '@/src/lib/logger';
import { parseLocalDate } from '@/src/utils/date';
import { triggerFileDownload } from '@/src/utils/download';
import {
  fromAttendanceSheetRows,
  mergeMarkedEntries,
  toAttendanceCsv,
  toAttendanceRecords,
} from '@/src/utils/attendance';
import {
  ATTENDANCE_PAGE_SIZE,
  ATTENDANCE_SHEET_SORT_BY,
  ATTENDANCE_SHEET_SORT_ORDER,
  EMPTY_ATTENDANCE_ENTRY,
  FALLBACK_ATTENDANCE_STATUS_OPTIONS,
} from '@/src/constants/attendance';
import { NOTIFICATION_TYPES, STRINGS } from '@/src/constants/strings';
import { ALL_DEPARTMENTS, ALL_SHIFTS } from '@/src/lib/types/attendance';
import styles from './MarkAttendanceDashboard.module.scss';

import type { PaginationState } from '@tanstack/react-table';
import type { User } from '@/src/lib/types/auth';
import type { DropdownOption } from '../Dropdown/Dropdown';
import type {
  AttendanceEntries,
  AttendanceEntry,
  AttendanceStatusOption,
  AttendanceWriteResult,
  MarkAttendanceEmployee,
  MarkAttendanceFilters,
  MarkAttendanceRecord,
  MarkAttendanceRequest,
} from '@/src/lib/types/attendance';

/**
 * What one write of the day needs to know about itself — see `saveDay`. The
 * draft and the submission differ only in these, which is why they share
 * everything else.
 */
interface SaveDayOptions {
  /** The Server Function to post the day to. */
  save: (request: MarkAttendanceRequest) => Promise<AttendanceWriteResult>;

  /** What the confirmation is headed, either way. The detail is the API's. */
  successTitle: string;
  failureTitle: string;

  /** The flag to hold the footer's actions under while the request is in flight. */
  setBusy: (busy: boolean) => void;

  /**
   * An extra precondition, checked once the day is assembled. Returning `false`
   * calls the write off — and takes on telling the user why.
   */
  canSave?: (records: MarkAttendanceRecord[]) => boolean;

  /** Whether a success makes the sheet on screen stale enough to re-read. */
  refreshOnSuccess?: boolean;
}

/** Where the sheet starts, and what "Reset" and a fresh scope go back to. */
const INITIAL_PAGINATION: PaginationState = { pageIndex: 0, pageSize: ATTENDANCE_PAGE_SIZE };

const NO_ENTRIES: AttendanceEntries = {};

/**
 * Define the props available for the MarkAttendanceDashboard component.
 */
interface MarkAttendanceDashboardProps {
  /**
   * The signed-in user, for the header's profile menu. Resolved on the server
   * so the menu is populated in the first paint rather than after a fetch.
   */
  currentUser?: User | null;

  /**
   * The departments the day can be narrowed to, in the order the backend
   * returns them. "All Departments" is added here rather than expected in the
   * list, so the option exists even when the list comes back empty.
   */
  departments?: DropdownOption[];

  /** The shifts the day can be narrowed to, on the same terms as departments. */
  shifts?: DropdownOption[];

  /**
   * The statuses a row can be marked with, as `/attendance/options` offers
   * them. An empty list — the options read having failed — falls back to
   * {@link FALLBACK_ATTENDANCE_STATUS_OPTIONS}, since a status dropdown with
   * nothing in it would leave the sheet unmarkable.
   */
  statuses?: AttendanceStatusOption[];
}

export default function MarkAttendanceDashboard({
  currentUser,
  departments = [],
  shifts = [],
  statuses = [],
}: MarkAttendanceDashboardProps) {
  const today = useToday();

  /*
  Null until the user picks a date, which is what makes "today" follow the
  clock rather than freezing at whatever it was when the screen mounted — and
  what Reset goes back to. `today` is empty during the server render, so the
  field starts blank on both sides of hydration and fills in on the client.
  */
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [department, setDepartment] = useState(ALL_DEPARTMENTS);
  const [shift, setShift] = useState(ALL_SHIFTS);

  const date = selectedDate ?? today;

  /*
  The scope the screen is showing, which only moves when View is pressed —
  editing the fields is not meant to re-read the day out from under whatever is
  already on screen. This is what the sheet is requested with.

  Empty only until the client's clock arrives, which is the one render nobody
  can act on; the effect below opens it on today across every department.
  */
  const [appliedFilters, setAppliedFilters] = useState<MarkAttendanceFilters>({
    date: '',
    department: ALL_DEPARTMENTS,
    shift: ALL_SHIFTS,
  });

  /*
  The employees the applied scope covers — one page at a time, since the sheet
  is fed by the same server-paginated employee list the Employees screen uses.
  */
  const [employees, setEmployees] = useState<MarkAttendanceEmployee[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>(INITIAL_PAGINATION);

  /**
   * The scope the rows on screen were read for. Loading is derived from it
   * rather than flagged on and off: the table shows its skeleton from the
   * render that changes the scope, instead of a render later when an effect
   * gets around to saying so.
   */
  const [loadedScope, setLoadedScope] = useState('');

  /**
   * Bumped every time View is pressed, so pressing it again re-reads the same
   * day rather than being mistaken for the scope the screen is already on.
   */
  const [viewCount, setViewCount] = useState(0);

  /*
  Every marking made for the day, keyed by Employee ID rather than held on the
  rows: paging, searching and re-reading the day all replace `employees`, and
  none of them may cost the user a marking they have already made.
  */
  const [entries, setEntries] = useState<AttendanceEntries>(NO_ENTRIES);

  /*
  Whether a day is being written, and which way. Kept apart so the footer can
  show the spinner on the button that was actually pressed — but either one
  holds both actions, since they write the same day.
  */
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBusy = isSavingDraft || isSubmitting;

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [appliedSearch, setAppliedSearch] = useState(debouncedSearch);

  const { showNotification } = useNotification();

  /**
   * Server Functions have no `AbortController`, so a response that a newer
   * request has already overtaken is discarded by sequence number instead.
   */
  const latestRequestIdRef = useRef(0);

  /**
   * Moves the screen onto a scope: a new day, department or shift starts from
   * the first page with a clear search box and no markings of its own — a day
   * already saved as a draft comes back marked on the sheet itself, so there is
   * nothing to restore from here.
   *
   * The one place a scope changes, so View, Reset and the opening read cannot
   * drift apart on what "showing a day" means.
   */
  const applyScope = useCallback((scope: MarkAttendanceFilters) => {
    setAppliedFilters(scope);
    setPagination(INITIAL_PAGINATION);
    setSearch('');
    setEntries(NO_ENTRIES);

    /* Re-reading the same scope has to count as a new request, not as a no-op. */
    setViewCount((previous) => previous + 1);
  }, []);

  /*
  A new query always restarts at the first page. Adjusted during render —
  React's recommended pattern for derived state — rather than in an effect, so
  the fetch below sees the corrected page in this same pass.
  */
  if (appliedSearch !== debouncedSearch) {
    setAppliedSearch(debouncedSearch);

    if (pagination.pageIndex !== 0) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }

  /*
  Opens on today, across every department — the scope the filters already read,
  so the screen the user lands on is the one they came to mark and View is left
  for changing it.

  Adjusted during render for the same reason as the search above: the scope is
  in place before the fetch below is reached, so the opening read costs no extra
  pass. It waits for `today`, which is deliberately unknown until the client's
  clock is available, and runs only while no scope has been applied — Reset goes
  back through the same door and must not be re-opened from here afterwards.
  */
  if (today && !appliedFilters.date) {
    applyScope({ date: today, department: ALL_DEPARTMENTS, shift: ALL_SHIFTS });
  }

  const departmentOptions = useMemo<DropdownOption[]>(
    () => [{ label: STRINGS.ALL_DEPARTMENTS, value: ALL_DEPARTMENTS }, ...departments],
    [departments]
  );

  const shiftOptions = useMemo<DropdownOption[]>(
    () => [{ label: STRINGS.ALL_SHIFTS, value: ALL_SHIFTS }, ...shifts],
    [shifts]
  );

  /*
  The floor under a failed options read — see the `statuses` prop. Memoised
  because the table's column definitions are built from this list, and a new
  array every render would rebuild them on every keystroke.
  */
  const statusOptions = useMemo(
    () => (statuses.length > 0 ? statuses : FALLBACK_ATTENDANCE_STATUS_OPTIONS),
    [statuses]
  );

  /** The same list as a set, for narrowing the statuses rows arrive marked with. */
  const statusValues = useMemo(() => new Set(statusOptions.map((option) => option.value)), [statusOptions]);

  /*
  A day that has not happened yet has no attendance to mark, so the calendar
  stops at today. Undefined until the client knows what today is, which leaves
  the calendar unbounded for the server render nobody can click.
  */
  const maxDate = useMemo(() => (today ? parseLocalDate(today) : undefined), [today]);

  /**
   * Everything a request is made of, in one comparable value — what the rows
   * on screen are checked against to know whether they are still current.
   */
  const requestScope = [
    viewCount,
    appliedFilters.date,
    appliedFilters.department,
    appliedFilters.shift,
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch,
  ].join('|');

  /*
  True through the first render too, when the date is still unknown: the screen
  is on its way to today's sheet from the moment it mounts, so the table shows
  its skeleton rather than an empty "no data" it would immediately replace.
  */
  const isLoading = loadedScope !== requestScope;

  /*
  Reads the page of the sheet the applied scope covers. Nothing is fetched until
  View has been pressed, so the screen never lists a day the user has not asked
  for.

  One request answers the whole screen — the rows, the day's total and its
  paging all arrive together — and every criterion is left off when it does not
  narrow anything, so an unfiltered day is the smallest query the backend can be
  asked for.
  */
  useEffect(() => {
    if (!appliedFilters.date) {
      return;
    }

    const requestId = ++latestRequestIdRef.current;

    getAttendanceSheet({
      date: appliedFilters.date,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sortBy: ATTENDANCE_SHEET_SORT_BY,
      sortOrder: ATTENDANCE_SHEET_SORT_ORDER,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(appliedFilters.department !== ALL_DEPARTMENTS ? { departments: [appliedFilters.department] } : {}),
      ...(appliedFilters.shift !== ALL_SHIFTS ? { shiftCodes: [appliedFilters.shift] } : {}),
    })
      .then((result) => {
        // A newer request has since been kicked off — ignore this stale response.
        if (latestRequestIdRef.current !== requestId) {
          return;
        }

        if (result.success) {
          const { employees: rows, marked } = fromAttendanceSheetRows(result.data.rows, statusValues);

          setEmployees(rows);
          setTotalItems(result.data.meta.totalItems);

          /*
          A day that has already been marked comes back marked, so the sheet
          opens on what is recorded rather than blank. Folded in rather than
          assigned: whatever the user has typed — or restored from a draft —
          outranks it, and a page turn must not undo their work.
          */
          setEntries((previous) => mergeMarkedEntries(previous, marked));
        } else {
          showNotification(
            STRINGS.ATTENDANCE_FETCH_FAILED,
            result.message,
            NOTIFICATION_TYPES.ERROR,
            5000,
            'top-right',
            false
          );
        }
      })
      .catch((error) => {
        if (latestRequestIdRef.current !== requestId) {
          return;
        }

        logger.error('Unexpected error fetching the attendance sheet:', error);
        showNotification(STRINGS.ATTENDANCE_FETCH_FAILED, '', NOTIFICATION_TYPES.ERROR, 5000, 'top-right', false);
      })
      .finally(() => {
        /*
        Marked as loaded even when the request failed: the skeleton is there to
        say a read is in flight, and one that is over has to give way to the
        error the user was just shown.
        */
        if (latestRequestIdRef.current === requestId) {
          setLoadedScope(requestScope);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestScope]);

  /**
   * Stable for the life of the screen, so the table's column definitions — and
   * with them every cell of every row the user is not editing — survive a
   * keystroke untouched.
   */
  const handleEntryChange = useCallback((employeeId: string, patch: Partial<AttendanceEntry>) => {
    setEntries((previous) => ({
      ...previous,
      [employeeId]: { ...(previous[employeeId] ?? EMPTY_ATTENDANCE_ENTRY), ...patch },
    }));
  }, []);

  const handleView = () => applyScope({ date, department, shift });

  /*
  Back to the view the screen opens on — today, every department — rather than
  to a blank screen: the sheet always shows a day now, so "reset" means the
  default day rather than none at all.
  */
  const handleReset = () => {
    setSelectedDate(null);
    setDepartment(ALL_DEPARTMENTS);
    setShift(ALL_SHIFTS);
    applyScope({ date: today, department: ALL_DEPARTMENTS, shift: ALL_SHIFTS });
  };

  /**
   * The half a draft and a submission have in common: assemble the day, refuse
   * an empty one, send it, and report whatever the backend says of it.
   *
   * Written once because the two differ in only three things — where they post,
   * what they call the outcome, and whether the day has to be complete first —
   * and none of those is a reason for two copies of the request handling.
   */
  const saveDay = async ({ save, successTitle, failureTitle, setBusy, canSave, refreshOnSuccess }: SaveDayOptions) => {
    /* A second press while the first is still in flight would write the day twice. */
    if (isBusy) {
      return;
    }

    const records = toAttendanceRecords(entries);

    if (records.length === 0) {
      showNotification(STRINGS.ATTENDANCE_NOTHING_TO_MARK, '', NOTIFICATION_TYPES.WARNING, 5000, 'top-right', false);

      return;
    }

    /* The caller's own precondition — it has already told the user why not. */
    if (canSave && !canSave(records)) {
      return;
    }

    /*
    The scope is read now rather than in the callbacks below: the user is free
    to move the screen onto another day while the request is in flight, and what
    is confirmed has to be the day that was actually sent.
    */
    const savedScope = appliedFilters;

    setBusy(true);

    try {
      const result = await save({ date: savedScope.date, records });

      /*
      The detail line is the backend's own message — "Attendance saved as
      draft.", and whatever it says when it refuses — so the user is told what
      was actually recorded rather than what this screen assumed.
      */
      showNotification(
        result.success ? successTitle : failureTitle,
        result.message,
        result.success ? NOTIFICATION_TYPES.SUCCESS : NOTIFICATION_TYPES.ERROR,
        5000,
        'top-right',
        false
      );

      /* Only if the screen is still on the day that was sent. */
      if (result.success && refreshOnSuccess && appliedFilters === savedScope) {
        setViewCount((previous) => previous + 1);
      }
    } catch (error) {
      logger.error('Unexpected error writing attendance:', error);
      showNotification(failureTitle, '', NOTIFICATION_TYPES.ERROR, 5000, 'top-right', false);
    } finally {
      setBusy(false);
    }
  };

  /*
  A draft is the same payload as a submission, minus the completeness check:
  being unfinished is the whole reason it is being saved. Nothing is re-read
  afterwards either — what came back is what is already on screen.
  */
  const handleSaveDraft = () =>
    saveDay({
      save: saveAttendanceDraft,
      successTitle: STRINGS.ATTENDANCE_DRAFT_SAVED,
      failureTitle: STRINGS.ATTENDANCE_DRAFT_SAVE_FAILED,
      setBusy: setIsSavingDraft,
    });

  /*
  The sheet as it stands, for the rows currently listed — the export is the
  page on screen, marked or not, rather than a separately filtered view of it.
  */
  const handleExport = () => {
    if (employees.length === 0) {
      showNotification(STRINGS.NO_DATA_FOUND, '', NOTIFICATION_TYPES.WARNING, 5000, 'top-right', false);

      return;
    }

    const csv = toAttendanceCsv(employees, entries, statusOptions);

    triggerFileDownload(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `attendance-${appliedFilters.date}.csv`);

    showNotification(
      STRINGS.ATTENDANCE_EXPORTED_SUCCESSFULLY,
      '',
      NOTIFICATION_TYPES.SUCCESS,
      5000,
      'top-right',
      false
    );
  };

  /**
   * A day is submitted whole: every employee in scope carries a status, or the
   * partial work belongs in a draft. Counted against the scope's total rather
   * than the page on screen, so pages the user never opened are caught.
   */
  const isDayComplete = (records: MarkAttendanceRecord[]) => {
    if (records.length >= totalItems) {
      return true;
    }

    showNotification(
      STRINGS.ATTENDANCE_INCOMPLETE,
      `${totalItems - records.length} of ${totalItems} ${STRINGS.ATTENDANCE_UNMARKED_MESSAGE}`,
      NOTIFICATION_TYPES.WARNING,
      5000,
      'top-right',
      false
    );

    return false;
  };

  const handleSubmit = () =>
    saveDay({
      save: submitAttendance,
      successTitle: STRINGS.ATTENDANCE_SUBMITTED,
      failureTitle: STRINGS.ATTENDANCE_SUBMIT_FAILED,
      setBusy: setIsSubmitting,
      canSave: isDayComplete,

      /* The backend owns the day's state and its head count from here on. */
      refreshOnSuccess: true,
    });

  return (
    <div className={styles.container}>
      <AppHeader
        title={STRINGS.MARK_ATTENDANCE}
        subtitle={STRINGS.MARK_ATTENDANCE_SUBTITLE}
        userDetails={currentUser}
      />

      <div className={styles.content}>
        <div className={styles.filters}>
          <div className={styles.field}>
            <DatePicker
              label={STRINGS.DATE}
              value={date}
              maxDate={maxDate}
              onChange={(value) => setSelectedDate(String(value ?? ''))}
            />
          </div>

          <div className={styles.field}>
            <Dropdown
              label={STRINGS.DEPARTMENT}
              options={departmentOptions}
              value={department}
              searchable
              onChange={setDepartment}
            />
          </div>

          <div className={styles.field}>
            <Dropdown label={STRINGS.SHIFT} options={shiftOptions} value={shift} searchable onChange={setShift} />
          </div>

          <div className={styles.actions}>
            {/* Nothing to scope the day to until a date is chosen. */}
            <Button className={styles.button} disabled={!date} onClick={handleView}>
              {STRINGS.VIEW}
            </Button>

            <Button variant="secondary" className={styles.button} onClick={handleReset}>
              {STRINGS.RESET}
            </Button>
          </div>
        </div>

        {/*
        Always on screen: the sheet opens on today, so there is no state in
        which the user is looking at no day at all.
        */}
        <MarkAttendanceTable
          employees={employees}
          entries={entries}
          onEntryChange={handleEntryChange}
          statusOptions={statusOptions}
          search={search}
          onSearchChange={setSearch}
          pagination={pagination}
          onPaginationChange={setPagination}
          totalItems={totalItems}
          isLoading={isLoading}
          isSavingDraft={isSavingDraft}
          isSubmitting={isSubmitting}
          onExport={handleExport}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
