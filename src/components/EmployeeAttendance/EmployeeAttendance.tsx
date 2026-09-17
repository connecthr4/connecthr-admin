/**
 * One employee's attendance history, as the details screen's Attendance
 * section shows it: a day per row, read-only.
 *
 * The whole history is on screen at once rather than paged — the endpoint
 * answers with every day on record in one read, so a pager would only be
 * splitting up rows the table already holds. The rows are rendered as they
 * arrive: the backend resolves the status label, the shift name and the
 * overtime label, so nothing has to be reformatted — or kept in step with the
 * attendance module — here.
 *
 * @example
 * ```tsx
 * import EmployeeAttendance from '@src/components/EmployeeAttendance'
 *
 * <EmployeeAttendance rows={rows} isLoading={isLoading} errorMessage={errorMessage} onRetry={reload} />
 * ```
 */
'use client';

import { useMemo } from 'react';
import clsx from 'clsx';
import DataTable from '../DataTable';
import Button from '../Button';
import { Text2 } from '../Typography';
import { STRINGS } from '@/src/constants/strings';
import { getAttendanceStatusTone } from '@/src/utils/attendance';
import { formatLongDate } from '@/src/utils/date';
import styles from './EmployeeAttendance.module.scss';

import type { ColumnDef } from '@tanstack/react-table';
import type { EmployeeAttendanceRow } from '@/src/lib/types/attendance';
import type { AttendanceStatusTone } from '@/src/utils/attendance';

/** The class each tone is painted in here — the rule itself is shared. */
const TONE_STYLES: Record<AttendanceStatusTone, string> = {
  present: styles.present,
  absent: styles.absent,
  halfDay: styles.halfDay,
};

/**
 * The marking, as a tinted pill — a history is read down the status column, and
 * a tinted block is what makes that possible at a glance. A day that was never
 * marked gets a dash rather than an empty pill, since "nothing recorded" is a
 * state of its own and not a status.
 */
function StatusCell({ row }: { row: EmployeeAttendanceRow }) {
  if (!row.status) {
    return <span className={styles.muted}>{STRINGS.NOT_AVAILABLE}</span>;
  }

  const tone = getAttendanceStatusTone(row.status);

  return <span className={clsx(styles.statusPill, tone && TONE_STYLES[tone])}>{row.statusLabel ?? row.status}</span>;
}

/**
 * Built once for the life of the module rather than per render: nothing here
 * closes over state, so the definitions are constant and the table has no
 * reason to rebuild its cells as a new history lands.
 */
const EMPLOYEE_ATTENDANCE_COLUMNS: ColumnDef<EmployeeAttendanceRow>[] = [
  {
    id: 'slNo',
    header: STRINGS.SL_NO,

    /* The backend's own numbering, so the column stays truthful whatever order the rows arrive in. */
    cell: ({ row }) => <span className={styles.slNoCell}>{row.original.slNo}</span>,
  },
  {
    id: 'date',
    header: STRINGS.DATE,
    cell: ({ row }) => <span className={styles.dateCell}>{formatLongDate(row.original.date)}</span>,
  },
  {
    id: 'shift',
    header: STRINGS.SHIFT,
    cell: ({ row }) => row.original.shift || STRINGS.NOT_AVAILABLE,
  },
  {
    id: 'status',
    header: STRINGS.STATUS,
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
 * `EmployeeAttendanceRow`.
 */
const HistoryTable = DataTable as unknown as (props: {
  data: EmployeeAttendanceRow[];
  columns: ColumnDef<EmployeeAttendanceRow>[];
  isLoading?: boolean;
  paginated?: boolean;
  emptyMessage?: string;
}) => React.JSX.Element;

/**
 * Define the props available for the EmployeeAttendance component.
 */
interface EmployeeAttendanceProps {
  /** Every day on record for this employee, in the order the backend listed them. */
  rows: EmployeeAttendanceRow[];

  /** Draws the table's skeleton while the history is being read. */
  isLoading?: boolean;

  /**
   * Why the history could not be read. Shown instead of the table: an empty
   * table would claim the employee has no attendance, which is a different
   * thing from not having been able to look.
   */
  errorMessage?: string;

  /** Reads the history again. Offered alongside {@link errorMessage}. */
  onRetry?: () => void;
}

export default function EmployeeAttendance({
  rows,
  isLoading = false,
  errorMessage,
  onRetry,
}: EmployeeAttendanceProps) {
  /* Constant, but `DataTable` takes it as a prop — memoised to keep it identical. */
  const columns = useMemo(() => EMPLOYEE_ATTENDANCE_COLUMNS, []);

  if (errorMessage) {
    return (
      <div className={styles.errorState}>
        <Text2 className={styles.errorMessage}>{errorMessage}</Text2>

        {onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            {STRINGS.TRY_AGAIN}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <HistoryTable
        data={rows}
        columns={columns}
        isLoading={isLoading}
        paginated={false}
        emptyMessage={STRINGS.NO_ATTENDANCE_RECORDS}
      />
    </div>
  );
}
