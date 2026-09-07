/**
 * The marking sheet itself: one row per employee, with the status, overtime
 * and remarks for the day editable in place.
 *
 * The rows are handed in already paged — the sheet edits what it is given and
 * reports each change upward, so the markings outlive paging, searching and
 * anything else that swaps the rows underneath it.
 *
 * @example
 * ```tsx
 * import MarkAttendanceTable from '@src/components/MarkAttendanceTable'
 *
 * <MarkAttendanceTable
 *   employees={employees}
 *   entries={entries}
 *   onEntryChange={handleEntryChange}
 *   onExport={handleExport}
 *   onSaveDraft={handleSaveDraft}
 *   onSubmit={handleSubmit}
 * />
 * ```
 */
'use client';

import { memo, useMemo } from 'react';
import clsx from 'clsx';
import { Download, Save, Send } from 'lucide-react';
import Button from '../Button';
import DataTable from '../DataTable';
import Dropdown from '../Dropdown';
import TableToolbar from '../TableToolbar';
import TextInput from '../TextInput';
import { Text3 } from '../Typography/Typography';
import { EMPTY_ATTENDANCE_ENTRY } from '@/src/constants/attendance';
import { STRINGS } from '@/src/constants/strings';
import { clampOvertimeHours, clampOvertimeMinutes, getAttendanceKey } from '@/src/utils/attendance';
import styles from './MarkAttendanceTable.module.scss';

import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import type {
  AttendanceEntries,
  AttendanceEntry,
  AttendanceStatus,
  AttendanceStatusOption,
  MarkAttendanceEmployee,
} from '@/src/lib/types/attendance';

/**
 * Reports one field of one row. A patch rather than a whole entry, so a cell
 * only has to know about the field it owns.
 */
type EntryChangeHandler = (employeeId: string, patch: Partial<AttendanceEntry>) => void;

/**
 * What a table row carries: who is being marked, and how. Pairing them here
 * rather than merging them keeps the employee object identical between
 * renders, so only the entry ever changes.
 */
interface AttendanceRow {
  employee: MarkAttendanceEmployee;

  /** What this row's entry is held under — see `getAttendanceKey`. */
  entryKey: string;
  entry: AttendanceEntry;
}

/**
 * How a status paints its cell — the sheet is read by colour at a glance.
 *
 * Matched by rule rather than by an exhaustive map: the statuses come from
 * `/attendance/options`, so one the backend adds has to land somewhere. Both
 * halves of a half day share the amber tone, and anything unrecognised is left
 * untinted rather than being given a colour that would claim something.
 */
function getStatusTone(status: AttendanceStatus): string | undefined {
  if (status.startsWith('HALF_DAY')) {
    return styles.halfDay;
  }

  if (status === 'PRESENT') {
    return styles.present;
  }

  if (status === 'ABSENT' || status === 'ON_LEAVE') {
    return styles.absent;
  }

  return undefined;
}

/**
 * The status picker: the app's own `Dropdown`, with its menu portalled so the
 * table's scroll container cannot clip it.
 *
 * The tone of the marking is painted on the wrapper rather than passed in, so
 * the shared component stays unaware of what its values mean here.
 */
const StatusCell = memo(function StatusCell({
  employeeId,
  value,
  options,
  onChange,
}: {
  employeeId: string;
  value: AttendanceStatus | '';
  options: AttendanceStatusOption[];
  onChange: EntryChangeHandler;
}) {
  return (
    <div className={clsx(styles.statusCell, value && getStatusTone(value))}>
      <Dropdown
        portalMenu
        options={options}
        placeholder={STRINGS.SELECT_STATUS}
        value={value}
        onChange={(status) => onChange(employeeId, { status: status as AttendanceStatus })}
      />
    </div>
  );
});

/**
 * The hours and minutes pair. Both fields are cleaned as they are typed, so
 * neither can hold something the submit step would have to reject.
 */
const OvertimeCell = memo(function OvertimeCell({
  employeeId,
  hours,
  minutes,
  onChange,
}: {
  employeeId: string;
  hours: string;
  minutes: string;
  onChange: EntryChangeHandler;
}) {
  return (
    <div className={styles.overtimeCell}>
      <TextInput
        aria-label={`${STRINGS.OVERTIME} ${STRINGS.OVERTIME_HOURS_PLACEHOLDER}`}
        className={styles.overtimeField}
        inputClassName={styles.overtimeInput}
        inputMode="numeric"
        placeholder={STRINGS.OVERTIME_HOURS_PLACEHOLDER}
        value={hours}
        onChange={(event) => onChange(employeeId, { overtimeHours: clampOvertimeHours(event.target.value) })}
      />

      <Text3 className={styles.overtimeSeparator}>:</Text3>

      <TextInput
        aria-label={`${STRINGS.OVERTIME} ${STRINGS.OVERTIME_MINUTES_PLACEHOLDER}`}
        className={styles.overtimeField}
        inputClassName={styles.overtimeInput}
        inputMode="numeric"
        placeholder={STRINGS.OVERTIME_MINUTES_PLACEHOLDER}
        value={minutes}
        onChange={(event) => onChange(employeeId, { overtimeMinutes: clampOvertimeMinutes(event.target.value) })}
      />
    </div>
  );
});

const RemarksCell = memo(function RemarksCell({
  employeeId,
  value,
  onChange,
}: {
  employeeId: string;
  value: string;
  onChange: EntryChangeHandler;
}) {
  return (
    <TextInput
      aria-label={STRINGS.REMARKS}
      className={styles.remarksField}
      placeholder={STRINGS.ADD_REMARKS}
      value={value}
      onChange={(event) => onChange(employeeId, { remarks: event.target.value })}
    />
  );
});

/**
 * Built once per change handler and status list rather than per render: both
 * are stable, so the definitions are too, and a keystroke re-renders only the
 * cells whose own props actually moved.
 */
function buildAttendanceColumns(
  onEntryChange: EntryChangeHandler,
  statusOptions: AttendanceStatusOption[]
): ColumnDef<AttendanceRow>[] {
  return [
    {
      id: 'employeeId',
      header: STRINGS.EMPLOYEE_ID,
      cell: ({ row }) => <span className={styles.idCell}>{row.original.employee.employeeId}</span>,
    },
    {
      id: 'name',
      header: STRINGS.EMPLOYEE_NAME,
      cell: ({ row }) => <span className={styles.nameCell}>{row.original.employee.name}</span>,
    },
    {
      id: 'department',
      header: STRINGS.DEPARTMENT,
      cell: ({ row }) => row.original.employee.department || STRINGS.NOT_AVAILABLE,
    },
    {
      id: 'shift',
      header: STRINGS.SHIFT,
      cell: ({ row }) => row.original.employee.shift || STRINGS.NOT_AVAILABLE,
    },
    {
      id: 'status',
      header: STRINGS.ATTENDANCE_STATUS,
      cell: ({ row }) => (
        <StatusCell
          employeeId={row.original.entryKey}
          value={row.original.entry.status}
          options={statusOptions}
          onChange={onEntryChange}
        />
      ),
    },
    {
      id: 'overtime',
      header: STRINGS.OVERTIME,
      cell: ({ row }) => (
        <OvertimeCell
          employeeId={row.original.entryKey}
          hours={row.original.entry.overtimeHours}
          minutes={row.original.entry.overtimeMinutes}
          onChange={onEntryChange}
        />
      ),
    },
    {
      id: 'remarks',
      header: STRINGS.REMARKS,
      cell: ({ row }) => (
        <RemarksCell employeeId={row.original.entryKey} value={row.original.entry.remarks} onChange={onEntryChange} />
      ),
    },
  ];
}

/**
 * `DataTable` is generic and wrapped in `memo()`, which TypeScript can't
 * instantiate per call site — cast once here so this file stays typed for `AttendanceRow`.
 */
const AttendanceTable = DataTable as unknown as (props: {
  data: AttendanceRow[];
  columns: ColumnDef<AttendanceRow>[];
  manualPagination?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  totalItems?: number;
  isLoading?: boolean;
}) => React.JSX.Element;

/**
 * Define the props available for the MarkAttendanceTable component.
 */
interface MarkAttendanceTableProps {
  /** The employees on the current page, in the order they are listed. */
  employees: MarkAttendanceEmployee[];

  /**
   * Every marking made for the day so far, keyed by employee id — including
   * rows on pages that are not currently on screen.
   */
  entries: AttendanceEntries;

  /** Called with the changed field of a single row. Must be referentially stable. */
  onEntryChange: EntryChangeHandler;

  /**
   * The statuses a row can be marked with, as `/attendance/options` offers
   * them. Must be referentially stable, for the same reason `onEntryChange` is.
   */
  statusOptions: AttendanceStatusOption[];

  /** The search box's value (controlled). */
  search: string;
  onSearchChange: (value: string) => void;

  pagination: PaginationState;
  onPaginationChange: (pagination: PaginationState) => void;

  /** Total employees in scope, across every page. */
  totalItems: number;

  isLoading?: boolean;

  /*
  Which write is in flight, if either. Both actions are held while either one
  is running — they write the same day — but only the button that was pressed
  spins.
  */
  isSavingDraft?: boolean;
  isSubmitting?: boolean;

  onExport: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

export default function MarkAttendanceTable({
  employees,
  entries,
  onEntryChange,
  statusOptions,
  search,
  onSearchChange,
  pagination,
  onPaginationChange,
  totalItems,
  isLoading = false,
  isSavingDraft = false,
  isSubmitting = false,
  onExport,
  onSaveDraft,
  onSubmit,
}: MarkAttendanceTableProps) {
  const columns = useMemo(() => buildAttendanceColumns(onEntryChange, statusOptions), [onEntryChange, statusOptions]);

  /*
  An untouched row points at the one shared empty entry rather than allocating
  its own, so the cells of rows nobody has edited keep identical props and skip
  re-rendering while another row is being typed into.
  */
  const rows = useMemo<AttendanceRow[]>(
    () =>
      employees.map((employee) => {
        const entryKey = getAttendanceKey(employee);

        return { employee, entryKey, entry: entries[entryKey] ?? EMPTY_ATTENDANCE_ENTRY };
      }),
    [employees, entries]
  );

  return (
    <div className={styles.wrapper}>
      <TableToolbar
        searchValue={search}
        onSearchChange={onSearchChange}
        searchPlaceholder={STRINGS.SEARCH_EMPLOYEE_NAME_OR_ID}
        showFilter={false}
      />

      <div className={styles.tableContainer}>
        <AttendanceTable
          data={rows}
          columns={columns}
          manualPagination
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          totalItems={totalItems}
          isLoading={isLoading}
        />
      </div>

      <div className={styles.actions}>
        <Button
          variant="secondary"
          startIcon={Save}
          className={styles.actionButton}
          disabled={isSubmitting}
          loading={isSavingDraft}
          onClick={onSaveDraft}
        >
          {STRINGS.SAVE_AS_DRAFT}
        </Button>

        <Button
          startIcon={Send}
          className={styles.actionButton}
          disabled={isSavingDraft}
          loading={isSubmitting}
          onClick={onSubmit}
        >
          {STRINGS.SUBMIT_ATTENDANCE}
        </Button>
      </div>
    </div>
  );
}
