/**
 * The read-only view of a day's attendance and overtime records: the head count
 * the day stands at, and the records behind it.
 *
 * The day is chosen above the table and is the only thing the screen insists
 * on — it opens on today, unnarrowed. Department and status are optional
 * narrowings, taken from the table toolbar's filter panel where several of each
 * can be ticked at once. Nothing here is editable: this screen reports what was
 * marked rather than marking it.
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

import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { Download } from 'lucide-react';
import AppHeader from '../AppHeader';
import AttendanceListTable from '../AttendanceListTable';
import Button from '../Button';
import DatePicker from '../DatePicker';
import ExportConfirmationModal from '../ExportConfirmationModal';
import ExportScopeOptions from '../ExportScopeOptions';
import { Heading2, Text2 } from '../Typography';
import { useToday } from '@/src/hooks/useToday';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useNotification } from '@/src/providers/NotificationProvider';
import { getAttendanceSheet } from '@/src/lib/actions/attendance';
import { AttendanceClient } from '@/src/lib/api/attendanceClient';
import { getApiErrorInfo } from '@/src/lib/api/helpers';
import { logger } from '@/src/lib/logger';
import { parseLocalDate } from '@/src/utils/date';
import {
  ATTENDANCE_PAGE_SIZE,
  ATTENDANCE_SHEET_SORT_BY,
  ATTENDANCE_SHEET_SORT_ORDER,
  FALLBACK_ATTENDANCE_STATUS_OPTIONS,
} from '@/src/constants/attendance';
import { NOTIFICATION_TYPES, STRINGS } from '@/src/constants/strings';
import { EMPTY_ATTENDANCE_SUMMARY } from '@/src/lib/types/attendance';
import styles from './AttendanceListDashboard.module.scss';

import type { PaginationState } from '@tanstack/react-table';
import type { User } from '@/src/lib/types/auth';
import type { DropdownOption } from '../Dropdown/Dropdown';
import type { ExportScope } from '../ExportScopeOptions';
import type { FilterSelection } from '../FilterPopover';
import type { FilterOptions } from '@/src/lib/types/filters';
import type {
  AttendanceSheetRow,
  AttendanceStatusOption,
  AttendanceSummary,
  ExportAttendanceRequest,
} from '@/src/lib/types/attendance';

/** Where the listing starts, and what a fresh scope goes back to. */
const INITIAL_PAGINATION: PaginationState = { pageIndex: 0, pageSize: ATTENDANCE_PAGE_SIZE };

const NO_ROWS: AttendanceSheetRow[] = [];

/** Nothing ticked — the scope the screen opens on. */
const NO_SELECTION: FilterSelection = {};

/** What an untouched filter group reads as, shared so it stays referentially stable. */
const NO_VALUES: string[] = [];

/**
 * The filter panel's group ids, which are deliberately the names of the request
 * fields they fill: a selection becomes a request body directly, with no
 * translation table in between that could drift from either side.
 */
const DEPARTMENTS_FILTER_ID = 'departments';
const STATUSES_FILTER_ID = 'statuses';

/**
 * The export scope the modal opens on. The whole roster is the safer default:
 * it is what a user reaching for "Export" usually means, and it cannot
 * silently omit rows they forgot they had filtered out.
 */
const DEFAULT_EXPORT_SCOPE: ExportScope = 'all';

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

/**
 * The department and status values a request should carry, read out of the
 * panel's selection. Groups the user left empty come back as one shared empty
 * array rather than a fresh one, so an unnarrowed screen doesn't churn
 * identities on every render.
 */
function readSelection(selection: FilterSelection) {
  return {
    departments: selection[DEPARTMENTS_FILTER_ID] ?? NO_VALUES,
    statuses: selection[STATUSES_FILTER_ID] ?? NO_VALUES,
  };
}

/** The criteria a `filtered` export repeats, as the listing was read with. */
interface ExportCriteria {
  date: string;
  departments: string[];
  statuses: string[];
  search: string;
}

/**
 * Builds the export payload.
 *
 * The date is sent on both scopes — an attendance export is always one day's,
 * so "all" means the whole roster for that day rather than every day on
 * record. On `filtered` the narrowing is the very same the list request was
 * made with, so the file matches the rows on screen; on `all` it is left off
 * entirely. The sort is sent either way, so the file is ordered like the table
 * rather than however the backend happens to default.
 */
function toExportRequest(scope: ExportScope, criteria: ExportCriteria): ExportAttendanceRequest {
  const request: ExportAttendanceRequest = {
    scope,
    date: criteria.date,
    sortBy: ATTENDANCE_SHEET_SORT_BY,
    sortOrder: ATTENDANCE_SHEET_SORT_ORDER,
  };

  if (scope === 'all') {
    return request;
  }

  return {
    ...request,
    ...(criteria.search ? { search: criteria.search } : {}),
    ...(criteria.departments.length > 0 ? { departments: criteria.departments } : {}),
    ...(criteria.statuses.length > 0 ? { statuses: criteria.statuses } : {}),
  };
}

export default function AttendanceListDashboard({
  currentUser,
  departments = [],
  statuses = [],
}: AttendanceListDashboardProps) {
  const today = useToday();

  /*
  Null until the user picks a date, which is what makes "today" follow the clock
  rather than freezing at whatever it was when the screen mounted. `today` is
  empty during the server render, so the field starts blank on both sides of
  hydration and fills in on the client — the one render nobody can act on.
  */
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const date = selectedDate ?? today;

  /*
  What the toolbar's filter panel was last applied with. The panel keeps its own
  draft while the user ticks boxes and reports the whole selection on "Apply
  Filter", so the listing is never re-read halfway through a change of mind.
  */
  const [filterSelection, setFilterSelection] = useState<FilterSelection>(NO_SELECTION);

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

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportScope, setExportScope] = useState<ExportScope>(DEFAULT_EXPORT_SCOPE);
  const [isExporting, setIsExporting] = useState(false);

  const { showNotification } = useNotification();

  /**
   * Server Functions have no `AbortController`, so a response that a newer
   * request has already overtaken is discarded by sequence number instead.
   */
  const latestRequestIdRef = useRef(0);

  /*
  The two groups the filter panel offers. Departments are dropped when the
  options read came back with none, so the panel never shows a heading with
  nothing under it; statuses always have a floor to fall back to — see the
  `statuses` prop. Both halves of a half day are listed separately, which is
  what makes "first half" and "second half" tickable without a second group for
  the half.
  */
  const filterOptions = useMemo<FilterOptions>(() => {
    const departmentGroup: FilterOptions =
      departments.length > 0
        ? [{ id: DEPARTMENTS_FILTER_ID, label: STRINGS.DEPARTMENT, isMulti: true, options: departments }]
        : [];

    return [
      ...departmentGroup,
      {
        id: STATUSES_FILTER_ID,
        label: STRINGS.ATTENDANCE_STATUS,
        isMulti: true,
        options: statuses.length > 0 ? statuses : FALLBACK_ATTENDANCE_STATUS_OPTIONS,
      },
    ];
  }, [departments, statuses]);

  const { departments: selectedDepartments, statuses: selectedStatuses } = readSelection(filterSelection);

  /*
  A day that has not happened yet has no attendance to list, so the calendar
  stops at today. Undefined until the client knows what today is, which leaves
  the calendar unbounded for the server render nobody can click.
  */
  const maxDate = useMemo(() => (today ? parseLocalDate(today) : undefined), [today]);

  /**
   * What the listing is narrowed to, in one comparable value. Every criterion
   * except the page — changing any of them re-reads the day from its first
   * page, since the page the user was on may not exist in the new scope.
   */
  const queryScope = [date, selectedDepartments.join(','), selectedStatuses.join(','), debouncedSearch].join('|');

  const [appliedScope, setAppliedScope] = useState(queryScope);

  /*
  Back to the first page whenever the scope moves. Adjusted during render —
  React's recommended pattern for derived state — rather than in an effect, so
  the fetch below sees the corrected page in this same pass instead of reading
  a page that is about to be thrown away.
  */
  if (appliedScope !== queryScope) {
    setAppliedScope(queryScope);

    if (pagination.pageIndex !== 0) {
      setPagination((previous) => ({ ...previous, pageIndex: 0 }));
    }
  }

  /**
   * Everything a request is made of — what the rows on screen are checked
   * against to know whether they are still current.
   */
  const requestScope = [queryScope, pagination.pageIndex, pagination.pageSize].join('|');

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
    /* No day to read yet — the client's clock has not arrived. */
    if (!date) {
      return;
    }

    const requestId = ++latestRequestIdRef.current;

    getAttendanceSheet({
      date,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sortBy: ATTENDANCE_SHEET_SORT_BY,
      sortOrder: ATTENDANCE_SHEET_SORT_ORDER,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(selectedDepartments.length > 0 ? { departments: selectedDepartments } : {}),
      ...(selectedStatuses.length > 0 ? { statuses: selectedStatuses } : {}),
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

  /**
   * The scope resets on every open, so a one-off "filtered" export never
   * carries over into the next one the user reaches for.
   */
  const handleOpenExportModal = () => {
    setExportScope(DEFAULT_EXPORT_SCOPE);
    setIsExportModalOpen(true);
  };

  const handleExportAttendance = async () => {
    setIsExporting(true);

    try {
      await AttendanceClient.exportAttendance(
        toExportRequest(exportScope, {
          date,
          departments: selectedDepartments,
          statuses: selectedStatuses,
          search: debouncedSearch,
        })
      );

      setIsExportModalOpen(false);
      showNotification(
        STRINGS.ATTENDANCE_EXPORTED_SUCCESSFULLY,
        '',
        NOTIFICATION_TYPES.SUCCESS,
        5000,
        'top-right',
        false
      );
    } catch (error) {
      logger.error('Error occurred while exporting the attendance list:', error);
      const { message } = getApiErrorInfo(error);

      showNotification(STRINGS.ATTENDANCE_EXPORT_FAILED, message, NOTIFICATION_TYPES.ERROR, 5000, 'top-right', false);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={styles.container}>
      <AppHeader
        title={STRINGS.ATTENDANCE_LIST}
        subtitle={STRINGS.ATTENDANCE_LIST_SUBTITLE}
        userDetails={currentUser}
      />

      <div className={styles.content}>
        {/*
        The day the listing is for, and the only thing chosen above the table:
        it is the one criterion every request must carry, so it reads the day
        straight away rather than waiting behind an Apply button. Department and
        status are optional narrowings, and live in the toolbar's filter panel.
        */}
        <div className={styles.field}>
          <DatePicker
            label={STRINGS.DATE}
            value={date}
            maxDate={maxDate}
            /* Clearing the field falls back to today — the screen always shows a day. */
            onChange={(value) => setSelectedDate(value ? String(value) : null)}
          />
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
          filterOptions={filterOptions}
          onFilterChange={setFilterSelection}
          pagination={pagination}
          onPaginationChange={setPagination}
          totalItems={totalItems}
          isLoading={isLoading}
        >
          {/* Nothing to export until the day the file would cover is known. */}
          <Button
            variant="secondary"
            startIcon={Download}
            className={styles.exportButton}
            disabled={!date}
            onClick={handleOpenExportModal}
          >
            {STRINGS.EXPORT}
          </Button>
        </AttendanceListTable>
      </div>

      {isExportModalOpen && (
        <ExportConfirmationModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onConfirm={handleExportAttendance}
          description={STRINGS.EXPORT_ATTENDANCE_CONFIRMATION}
          isExporting={isExporting}
        >
          <ExportScopeOptions
            value={exportScope}
            onChange={setExportScope}
            allLabel={STRINGS.EXPORT_SCOPE_ALL_ATTENDANCE}
            disabled={isExporting}
          />
        </ExportConfirmationModal>
      )}
    </div>
  );
}
