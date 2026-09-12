/**
 * The records table of the Attendance List: one row per employee, showing what
 * the day was actually marked as. The same columns the marking sheet edits,
 * read-only — nothing here is a control the user can change.
 *
 * The rows are the API's own sheet rows, rendered as they arrive: the backend
 * already resolves the status label, the shift name and the overtime label, so
 * nothing has to be reformatted — or kept in step with the marking sheet — here.
 *
 * @example
 * ```tsx
 * import AttendanceListTable from '@src/components/AttendanceListTable'
 *
 * <AttendanceListTable
 *   rows={rows}
 *   search={search}
 *   onSearchChange={setSearch}
 *   filterOptions={filterOptions}
 *   onFilterChange={setFilterSelection}
 *   pagination={pagination}
 *   onPaginationChange={setPagination}
 *   totalItems={totalItems}
 * />
 * ```
 */
'use client';

import { useMemo } from 'react';
import clsx from 'clsx';
import DataTable from '../DataTable';
import TableToolbar from '../TableToolbar';
import { STRINGS } from '@/src/constants/strings';
import { getAttendanceStatusTone } from '@/src/utils/attendance';
import styles from './AttendanceListTable.module.scss';

import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import type { AttendanceSheetRow } from '@/src/lib/types/attendance';
import type { FilterOptions } from '@/src/lib/types/filters';
import type { FilterSelection } from '../FilterPopover';
import type { AttendanceStatusTone } from '@/src/utils/attendance';

/** The class each tone is painted in here — the rule itself is shared. */
const TONE_STYLES: Record<AttendanceStatusTone, string> = {
  present: styles.present,
  absent: styles.absent,
  halfDay: styles.halfDay,
};

/**
 * The marking, as a tinted pill — the listing is read by colour at a glance the
 * same way the sheet is. An unmarked row gets a dash rather than an empty pill,
 * since "nothing recorded" is a state of its own and not a status.
 *
 * The label is the backend's own, so a status it adds reads correctly here
 * without this screen having to learn its name.
 */
function StatusCell({ row }: { row: AttendanceSheetRow }) {
  if (!row.status) {
    return <span className={styles.muted}>{STRINGS.NOT_AVAILABLE}</span>;
  }

  const tone = getAttendanceStatusTone(row.status);

  return <span className={clsx(styles.statusPill, tone && TONE_STYLES[tone])}>{row.statusLabel ?? row.status}</span>;
}

/**
 * Built once for the life of the module rather than per render: nothing here
 * closes over state, so the definitions are constant and the table has no
 * reason to rebuild its cells as the user pages or types.
 */
const ATTENDANCE_LIST_COLUMNS: ColumnDef<AttendanceSheetRow>[] = [
  {
    id: 'employeeId',
    header: STRINGS.EMPLOYEE_ID,
    cell: ({ row }) => <span className={styles.idCell}>{row.original.employeeCode}</span>,
  },
  {
    id: 'name',
    header: STRINGS.EMPLOYEE_NAME,
    cell: ({ row }) => <span className={styles.nameCell}>{row.original.name}</span>,
  },
  {
    id: 'department',
    header: STRINGS.DEPARTMENT,
    cell: ({ row }) => row.original.department || STRINGS.NOT_AVAILABLE,
  },
  {
    id: 'shift',
    header: STRINGS.SHIFT,
    cell: ({ row }) => row.original.shift || STRINGS.NOT_AVAILABLE,
  },
  {
    id: 'status',
    header: STRINGS.ATTENDANCE_STATUS,
    cell: ({ row }) => <StatusCell row={row.original} />,
  },
  {
    id: 'overtime',
    header: STRINGS.OVERTIME,

    /*
    A day with no overtime comes back as "0h 00m", which would read as a figure
    someone entered — the dash says nothing was logged, which is what happened.
    */
    cell: ({ row }) => (row.original.overtime?.totalMinutes ? row.original.overtime.label : STRINGS.NOT_AVAILABLE),
  },
  {
    id: 'remarks',
    header: STRINGS.REMARKS,
    cell: ({ row }) => row.original.remarks || STRINGS.NOT_AVAILABLE,
  },
];

/**
 * `DataTable` is generic and wrapped in `memo()`, which TypeScript can't
 * instantiate per call site — cast once here so this file stays typed for
 * `AttendanceSheetRow`.
 */
const RecordsTable = DataTable as unknown as (props: {
  data: AttendanceSheetRow[];
  columns: ColumnDef<AttendanceSheetRow>[];
  manualPagination?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  totalItems?: number;
  isLoading?: boolean;
}) => React.JSX.Element;

/**
 * Define the props available for the AttendanceListTable component.
 */
interface AttendanceListTableProps {
  /** The rows on the current page, in the order the backend listed them. */
  rows: AttendanceSheetRow[];

  /** The search box's value (controlled). */
  search: string;
  onSearchChange: (value: string) => void;

  /**
   * The groups the toolbar's filter panel offers — department and status for
   * this listing. Built by the dashboard from the options endpoint, so the
   * panel can never offer a value no row could carry.
   */
  filterOptions?: FilterOptions;

  /** Called with the whole selection when the panel's "Apply Filter" is pressed. */
  onFilterChange?: (selection: FilterSelection) => void;

  pagination: PaginationState;
  onPaginationChange: (pagination: PaginationState) => void;

  /** Total records in scope, across every page. */
  totalItems: number;

  isLoading?: boolean;

  /**
   * Actions for the toolbar's right-hand side — the Export button, here.
   * Handed in rather than built in, so the table stays a table.
   */
  children?: React.ReactNode;
}

export default function AttendanceListTable({
  rows,
  search,
  onSearchChange,
  filterOptions,
  onFilterChange,
  pagination,
  onPaginationChange,
  totalItems,
  isLoading = false,
  children,
}: AttendanceListTableProps) {
  /* Constant, but `DataTable` takes it as a prop — memoised to keep it identical. */
  const columns = useMemo(() => ATTENDANCE_LIST_COLUMNS, []);

  return (
    <div className={styles.wrapper}>
      <TableToolbar
        searchValue={search}
        onSearchChange={onSearchChange}
        searchPlaceholder={STRINGS.SEARCH_EMPLOYEE_NAME_OR_ID}
        filterOptions={filterOptions}
        onFilterChange={onFilterChange}
      >
        {children}
      </TableToolbar>

      <div className={styles.tableContainer}>
        <RecordsTable
          data={rows}
          columns={columns}
          manualPagination
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          totalItems={totalItems}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
