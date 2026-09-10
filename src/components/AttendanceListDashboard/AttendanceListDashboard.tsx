/**
 * The read-only view of a day's attendance and overtime records: the head count
 * the day stands at, and the records behind it.
 *
 * The same day-and-department scope the marking sheet is read by, narrowed
 * further by status — and nothing on it is editable, since this screen reports
 * what was marked rather than marking it.
 *
 * @example
 * ```tsx
 * import AttendanceListDashboard from '@src/components/AttendanceListDashboard'
 *
 * export default function Page() {
 *   return <AttendanceListDashboard currentUser={currentUser} departments={departments} />;
 * }
 * ```
 */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import AppHeader from '../AppHeader';
import AttendanceListTable from '../AttendanceListTable';
import Button from '../Button';
import DatePicker from '../DatePicker';
import Dropdown from '../Dropdown';
import { Heading2, Text2 } from '../Typography';
import { useToday } from '@/src/hooks/useToday';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useNotification } from '@/src/providers/NotificationProvider';
import { getAttendanceSheet } from '@/src/lib/actions/attendance';
import { logger } from '@/src/lib/logger';
import { parseLocalDate } from '@/src/utils/date';
import {
  ATTENDANCE_PAGE_SIZE,
  ATTENDANCE_SHEET_SORT_BY,
  ATTENDANCE_SHEET_SORT_ORDER,
  FALLBACK_ATTENDANCE_STATUS_OPTIONS,
} from '@/src/constants/attendance';
import { NOTIFICATION_TYPES, STRINGS } from '@/src/constants/strings';
import { ALL_DEPARTMENTS, ALL_STATUSES, EMPTY_ATTENDANCE_SUMMARY } from '@/src/lib/types/attendance';
import styles from './AttendanceListDashboard.module.scss';

import type { PaginationState } from '@tanstack/react-table';
import type { User } from '@/src/lib/types/auth';
import type { DropdownOption } from '../Dropdown/Dropdown';
import type {
  AttendanceListFilters,
  AttendanceSheetRow,
  AttendanceStatusOption,
  AttendanceSummary,
} from '@/src/lib/types/attendance';

/** Where the listing starts, and what "Reset" and a fresh scope go back to. */
const INITIAL_PAGINATION: PaginationState = { pageIndex: 0, pageSize: ATTENDANCE_PAGE_SIZE };

const NO_ROWS: AttendanceSheetRow[] = [];

/**
 * Which tone a card's label and count are painted in. Named after what the
 * count means rather than the colour, so the palette can move without every
 * card being renamed.
 */
type SummaryTone = 'neutral' | 'success' | 'warning' | 'info';

interface SummaryCard {
  key: keyof AttendanceSummary;
  label: string;
  tone: SummaryTone;
}

/**
 * The cards, in the order they are laid out. A list rather than four copies of
 * the same markup — the only thing that differs between them is the count they
 * read and the tone they read it in.
 *
 * There is no "Absent" card: the backend no longer offers Absent as a status,
 * and reports the count as a permanent zero. A card that could only ever read
 * "0" would say nothing.
 */
const SUMMARY_CARDS: SummaryCard[] = [
  { key: 'totalEmployees', label: STRINGS.TOTAL_EMPLOYEES, tone: 'neutral' },
  { key: 'present', label: STRINGS.PRESENT, tone: 'success' },
  { key: 'onLeave', label: STRINGS.ON_LEAVE, tone: 'info' },
  { key: 'halfDay', label: STRINGS.HALF_DAY, tone: 'warning' },
];

const TONE_STYLES: Record<SummaryTone, string> = {
  neutral: styles.neutral,
  success: styles.success,
  warning: styles.warning,
  info: styles.info,
};

/**
 * Define the props available for the AttendanceListDashboard component.
 */
interface AttendanceListDashboardProps {
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

  /**
   * The statuses the listing can be narrowed to, as `/attendance/options`
   * offers them — the same list the sheet is marked from, so the filter can
   * never offer a status no row could carry. An empty list falls back to
   * {@link FALLBACK_ATTENDANCE_STATUS_OPTIONS}.
   */
  statuses?: AttendanceStatusOption[];
}

export default function AttendanceListDashboard({
  currentUser,
  departments = [],
  statuses = [],
}: AttendanceListDashboardProps) {
  const today = useToday();

  /*
  Null until the user picks a date, which is what makes "today" follow the clock
  rather than freezing at whatever it was when the screen mounted — and what
  Reset goes back to. `today` is empty during the server render, so the field
  starts blank on both sides of hydration and fills in on the client.
  */
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [department, setDepartment] = useState(ALL_DEPARTMENTS);
  const [status, setStatus] = useState(ALL_STATUSES);

  const date = selectedDate ?? today;

  /*
  The scope the screen is showing, which only moves when Apply is pressed —
  editing the fields is not meant to re-read the day out from under whatever is
  already listed.

  Empty only until the client's clock arrives, which is the one render nobody
  can act on; the block below opens it on today, unnarrowed.
  */
  const [appliedFilters, setAppliedFilters] = useState<AttendanceListFilters>({
    date: '',
    department: ALL_DEPARTMENTS,
    status: ALL_STATUSES,
  });

  const [rows, setRows] = useState<AttendanceSheetRow[]>(NO_ROWS);
  const [totalItems, setTotalItems] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>(INITIAL_PAGINATION);

  /*
  The day's head count, as the cards read it. Left at "no counts at all" until a
  day has actually loaded, so the cards show "--" rather than a zero that would
  claim nobody was present.
  */
  const [summary, setSummary] = useState<AttendanceSummary>(EMPTY_ATTENDANCE_SUMMARY);

  /**
   * The scope the rows on screen were read for. Loading is derived from it
   * rather than flagged on and off: the table shows its skeleton from the
   * render that changes the scope, instead of a render later when an effect
   * gets around to saying so.
   */
  const [loadedScope, setLoadedScope] = useState('');

  /**
   * Bumped every time Apply is pressed, so pressing it again re-reads the same
   * day rather than being mistaken for the scope the screen is already on.
   */
  const [viewCount, setViewCount] = useState(0);

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
   * Moves the screen onto a scope: a new day, department or status starts from
   * the first page with a clear search box.
   *
   * The one place a scope changes, so Apply, Reset and the opening read cannot
   * drift apart on what "showing a day" means.
   */
  const applyScope = useCallback((scope: AttendanceListFilters) => {
    setAppliedFilters(scope);
    setPagination(INITIAL_PAGINATION);
    setSearch('');

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
  Opens on today, unnarrowed — the scope the filters already read, so the screen
  the user lands on is the one they came for and Apply is left for changing it.

  Adjusted during render for the same reason as the search above. It waits for
  `today`, which is deliberately unknown until the client's clock is available,
  and runs only while no scope has been applied — Reset goes back through the
  same door and must not be re-opened from here afterwards.
  */
  if (today && !appliedFilters.date) {
    applyScope({ date: today, department: ALL_DEPARTMENTS, status: ALL_STATUSES });
  }

  const departmentOptions = useMemo<DropdownOption[]>(
    () => [{ label: STRINGS.ALL_DEPARTMENTS, value: ALL_DEPARTMENTS }, ...departments],
    [departments]
  );

  /*
  The floor under a failed options read — see the `statuses` prop. Both halves
  of a half day are listed separately, which is what makes "first half" and
  "second half" selectable filters without a second dropdown for the half.
  */
  const statusOptions = useMemo<DropdownOption[]>(
    () => [
      { label: STRINGS.ALL_STATUS, value: ALL_STATUSES },
      ...(statuses.length > 0 ? statuses : FALLBACK_ATTENDANCE_STATUS_OPTIONS),
    ],
    [statuses]
  );

  /*
  A day that has not happened yet has no attendance to list, so the calendar
  stops at today. Undefined until the client knows what today is, which leaves
  the calendar unbounded for the server render nobody can click.
  */
  const maxDate = useMemo(() => (today ? parseLocalDate(today) : undefined), [today]);

  /**
   * Everything a request is made of, in one comparable value — what the rows on
   * screen are checked against to know whether they are still current.
   */
  const requestScope = [
    viewCount,
    appliedFilters.date,
    appliedFilters.department,
    appliedFilters.status,
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch,
  ].join('|');

  /*
  True through the first render too, when the date is still unknown: the screen
  is on its way to today's records from the moment it mounts, so the table shows
  its skeleton rather than an empty "no data" it would immediately replace.
  */
  const isLoading = loadedScope !== requestScope;

  /*
  One request answers the whole screen — the rows, the day's head count and its
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
      ...(appliedFilters.status !== ALL_STATUSES ? { statuses: [appliedFilters.status] } : {}),
    })
      .then((result) => {
        // A newer request has since been kicked off — ignore this stale response.
        if (latestRequestIdRef.current !== requestId) {
          return;
        }

        if (result.success) {
          /*
          Rendered as they arrive: the backend already resolves the status
          label, the shift name and the overtime label, so the read-only table
          has nothing left to reformat.
          */
          setRows(result.data.rows);
          setTotalItems(result.data.meta.totalItems);
          setSummary(result.data.summary);
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

        logger.error('Unexpected error fetching the attendance list:', error);
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

  const handleApply = () => applyScope({ date, department, status });

  /*
  Back to the view the screen opens on — today, every department, every status —
  rather than to a blank screen: the listing always shows a day now, so "reset"
  means the default day rather than none at all.
  */
  const handleReset = () => {
    setSelectedDate(null);
    setDepartment(ALL_DEPARTMENTS);
    setStatus(ALL_STATUSES);
    applyScope({ date: today, department: ALL_DEPARTMENTS, status: ALL_STATUSES });
  };

  return (
    <div className={styles.container}>
      <AppHeader
        title={STRINGS.ATTENDANCE_LIST}
        subtitle={STRINGS.ATTENDANCE_LIST_SUBTITLE}
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
            <Dropdown label={STRINGS.STATUS} options={statusOptions} value={status} onChange={setStatus} />
          </div>

          <div className={styles.actions}>
            {/* Nothing to scope the day to until a date is chosen. */}
            <Button className={styles.button} disabled={!date} onClick={handleApply}>
              {STRINGS.APPLY}
            </Button>

            <Button variant="secondary" className={styles.button} onClick={handleReset}>
              {STRINGS.RESET}
            </Button>
          </div>
        </div>

        <div className={styles.summaryGrid}>
          {SUMMARY_CARDS.map(({ key, label, tone }) => (
            <div key={key} className={clsx(styles.summaryCard, TONE_STYLES[tone])}>
              <Text2 className={styles.summaryLabel}>{label}</Text2>

              <Heading2 className={styles.summaryValue}>{summary[key] ?? STRINGS.NOT_AVAILABLE}</Heading2>
            </div>
          ))}
        </div>

        {/*
        Always on screen: the listing opens on today, so there is no state in
        which the user is looking at no day at all.
        */}
        <AttendanceListTable
          rows={rows}
          search={search}
          onSearchChange={setSearch}
          pagination={pagination}
          onPaginationChange={setPagination}
          totalItems={totalItems}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
