/**
 * Helpers the Mark Attendance sheet edits, submits and exports its rows with.
 */

import {
  MAX_OVERTIME_HOURS,
  MAX_OVERTIME_MINUTES,
  MINUTES_PER_HOUR,
  OVERTIME_FIELD_LENGTH,
} from '../constants/attendance';
import { STRINGS } from '../constants/strings';

import type { DropdownOption } from '../components/Dropdown/Dropdown';
import type {
  AttendanceEntries,
  AttendanceEntry,
  AttendanceSheetRow,
  AttendanceStatus,
  AttendanceStatusOption,
  MarkAttendanceEmployee,
  MarkAttendanceOvertime,
  MarkAttendanceRecord,
} from '../lib/types/attendance';
import type { Shift } from '../lib/types/shifts';

/**
 * Keeps an overtime field to digits within its own ceiling, as it is typed.
 *
 * Cleaning on the way in rather than validating on the way out is what stops a
 * field ever holding something the submit step would have to reject: "9" then
 * "5" in the minutes box lands on 59, not on a 95 the user has to be told
 * about later.
 *
 * @param value - The raw input value.
 * @param max - The highest the field may read — 23 for hours, 59 for minutes.
 * @returns The cleaned value, or an empty string when the field was cleared.
 */
export function clampOvertimeField(value: string, max: number): string {
  const digits = value.replace(/\D/g, '').slice(0, OVERTIME_FIELD_LENGTH);

  if (!digits) {
    return '';
  }

  return String(Math.min(Number(digits), max));
}

/** Cleans the hours half of the overtime pair. */
export const clampOvertimeHours = (value: string) => clampOvertimeField(value, MAX_OVERTIME_HOURS);

/** Cleans the minutes half of the overtime pair. */
export const clampOvertimeMinutes = (value: string) => clampOvertimeField(value, MAX_OVERTIME_MINUTES);

/**
 * The overtime pair as the numbers a submission carries. An empty field counts
 * as zero, so "2h" with the minutes box left alone is two hours rather than
 * nothing — and both fields are already clamped as they are typed, so neither
 * needs re-checking here.
 */
export function toOvertimeParts(entry: AttendanceEntry): MarkAttendanceOvertime {
  return { hours: Number(entry.overtimeHours || 0), minutes: Number(entry.overtimeMinutes || 0) };
}

/** The same pair added up, for the places that read overtime as one figure. */
export function toOvertimeMinutes(entry: AttendanceEntry): number {
  const { hours, minutes } = toOvertimeParts(entry);

  return hours * MINUTES_PER_HOUR + minutes;
}

/**
 * The label a status is shown under, for the export file.
 *
 * @param options - The statuses `/attendance/options` offered, so the file
 * reads the way the dropdown did rather than from a second list that could
 * have drifted from it.
 */
export function getAttendanceStatusLabel(status: AttendanceStatus | '', options: AttendanceStatusOption[]): string {
  return options.find((option) => option.value === status)?.label ?? '';
}

/**
 * How a status is read at a glance. Named after what the marking means rather
 * than the colour, so each table can paint the tone in its own module without
 * the rule below being written twice.
 */
export type AttendanceStatusTone = 'present' | 'absent' | 'halfDay';

/**
 * The tone a status is painted in, or `undefined` for one that has none.
 *
 * Matched by rule rather than by an exhaustive map: the statuses come from
 * `/attendance/options`, so one the backend adds has to land somewhere. Both
 * halves of a half day share a tone, and anything unrecognised is left
 * untinted rather than being given a colour that would claim something.
 */
export function getAttendanceStatusTone(status: AttendanceStatus): AttendanceStatusTone | undefined {
  if (status.startsWith('HALF_DAY')) {
    return 'halfDay';
  }

  if (status === 'PRESENT') {
    return 'present';
  }

  if (status === 'ABSENT' || status === 'ON_LEAVE') {
    return 'absent';
  }

  return undefined;
}

/**
 * The shifts, as the dropdown takes them. The `code` is the value — it is what
 * a sheet row carries and what the sheet request filters on — and the `name` is
 * what the user reads.
 */
export const toShiftOptions = (shifts: Shift[]): DropdownOption[] =>
  shifts.map((shift) => ({ label: shift.name, value: shift.code }));

/**
 * The departments, as the dropdown takes them. The name is both halves: it is
 * what the user reads and what the sheet request is filtered by.
 */
export const toDepartmentOptions = (departments: string[]): DropdownOption[] =>
  departments.map((department) => ({ label: department, value: department }));

/** The overtime pair as "2h 30m", or an empty string when none was entered. */
export function formatOvertime(entry: AttendanceEntry): string {
  const minutes = toOvertimeMinutes(entry);

  if (minutes === 0) {
    return '';
  }

  return `${Math.floor(minutes / MINUTES_PER_HOUR)}h ${String(minutes % MINUTES_PER_HOUR).padStart(2, '0')}m`;
}

/**
 * The key one employee's marking is held under.
 *
 * The backend's own record id rather than the "EMP1001" code the sheet
 * displays: it is what `POST /attendance/submit` keys a record on, so a day
 * marked across several pages needs no translation at submit — where the rows
 * that carried the mapping may no longer even be on screen. Falls back to the
 * code on a row the backend sent no id for, which keeps two such rows from
 * sharing one entry.
 */
export const getAttendanceKey = (employee: MarkAttendanceEmployee) => employee.id || employee.employeeId;

/**
 * Narrows a status off the wire to one the dropdown can actually show.
 *
 * A status with no option for it is treated as unmarked rather than being put
 * into the dropdown as a value it cannot render — the row then reads "Select
 * status", which is at least true of what the user can do with it.
 *
 * @param statuses - The values the dropdown offers. Both sides come from the
 * same backend now, so this only catches an option list that failed to load and
 * fell back.
 */
function toAttendanceStatus(status: string | null, statuses: ReadonlySet<string>): AttendanceStatus | '' {
  return status && statuses.has(status) ? status : '';
}

/**
 * A row's existing marking, or `null` when nothing has been marked on it.
 *
 * The `null` matters: it is what lets an untouched row keep pointing at the one
 * shared {@link EMPTY_ATTENDANCE_ENTRY} instead of getting an identical copy of
 * its own, so the table's cells stay memo-stable while another row is typed in.
 *
 * A zero in either overtime field becomes an empty box rather than a literal
 * "0", so the row reads as untouched — which is what it is.
 */
function toAttendanceEntry(row: AttendanceSheetRow, statuses: ReadonlySet<string>): AttendanceEntry | null {
  const status = toAttendanceStatus(row.status, statuses);
  const remarks = row.remarks ?? '';
  const { hours = 0, minutes = 0 } = row.overtime ?? {};

  if (!status && !remarks && hours === 0 && minutes === 0) {
    return null;
  }

  return {
    status,
    overtimeHours: hours ? String(hours) : '',
    overtimeMinutes: minutes ? String(minutes) : '',
    remarks,
  };
}

/** One page of the sheet, in the two shapes the screen holds it in. */
export interface AttendanceSheetPage {
  /** Who is on the page, for the table. */
  employees: MarkAttendanceEmployee[];

  /** What the backend has already marked on it, keyed the way entries are. */
  marked: AttendanceEntries;
}

/**
 * Splits a page of sheet rows into the employees the table lists and the
 * markings the day already carries.
 *
 * Done in one pass, at the point the response lands, so the key each row is
 * held under is computed once — by {@link getAttendanceKey}, so the markings
 * line up with anything the user has since typed.
 *
 * @param statuses - The status values the dropdown offers, for narrowing what
 * each row arrived marked with.
 */
export function fromAttendanceSheetRows(
  rows: AttendanceSheetRow[],
  statuses: ReadonlySet<string>
): AttendanceSheetPage {
  const employees: MarkAttendanceEmployee[] = [];
  const marked: AttendanceEntries = {};

  rows.forEach((row) => {
    const employee: MarkAttendanceEmployee = {
      id: row.employeeId,
      employeeId: row.employeeCode,
      name: row.name,
      department: row.department,
      shift: row.shift,
    };

    employees.push(employee);

    const entry = toAttendanceEntry(row, statuses);

    if (entry) {
      marked[getAttendanceKey(employee)] = entry;
    }
  });

  return { employees, marked };
}

/**
 * Folds what the backend has already marked into what the user is working on.
 *
 * The user's own entry always wins: a row they have touched — or a draft they
 * restored — must not be overwritten by the page it happens to be listed on
 * being re-read. Only rows with no entry at all pick up the server's marking.
 *
 * @returns The same object when nothing was added, so the table's row memo
 * survives a page turn that taught it nothing new.
 */
export function mergeMarkedEntries(previous: AttendanceEntries, marked: AttendanceEntries): AttendanceEntries {
  const added = Object.keys(marked).filter((key) => !(key in previous));

  if (added.length === 0) {
    return previous;
  }

  const next = { ...previous };

  added.forEach((key) => {
    next[key] = marked[key];
  });

  return next;
}

/**
 * Turns the markings into the request body.
 *
 * Built from the entries rather than from the rows on screen, so a day
 * marked across several pages submits in full — an unmarked row simply has no
 * entry, and is absent from the payload the same way it is absent from the
 * user's intent.
 */
export function toAttendanceRecords(entries: AttendanceEntries): MarkAttendanceRecord[] {
  return Object.entries(entries).reduce<MarkAttendanceRecord[]>((records, [employeeId, entry]) => {
    if (entry.status) {
      records.push({
        employeeId,
        status: entry.status,
        overtime: toOvertimeParts(entry),
        remarks: entry.remarks.trim(),
      });
    }

    return records;
  }, []);
}

/**
 * Wraps a cell so a name carrying a comma, a quote or a line break survives
 * the trip into a spreadsheet as one field.
 */
function toCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

const CSV_HEADERS = [
  STRINGS.EMPLOYEE_ID,
  STRINGS.EMPLOYEE_NAME,
  STRINGS.DEPARTMENT,
  STRINGS.SHIFT,
  STRINGS.ATTENDANCE_STATUS,
  STRINGS.OVERTIME,
  STRINGS.REMARKS,
];

/**
 * Renders the sheet as CSV — the rows exactly as they read on screen, marked
 * or not, so the file is the marking sheet rather than a second, filtered view
 * of it.
 *
 * @param employees - The employees currently listed, in the order shown.
 * @param entries - Every marking made so far, keyed by employee id.
 * @param statusOptions - The statuses the dropdown offered, for their labels.
 */
export function toAttendanceCsv(
  employees: MarkAttendanceEmployee[],
  entries: AttendanceEntries,
  statusOptions: AttendanceStatusOption[]
): string {
  const rows = employees.map((employee) => {
    const entry = entries[getAttendanceKey(employee)];

    return [
      employee.employeeId,
      employee.name,
      employee.department,
      employee.shift ?? '',
      entry ? getAttendanceStatusLabel(entry.status, statusOptions) : '',
      entry ? formatOvertime(entry) : '',
      entry?.remarks ?? '',
    ]
      .map(toCsvCell)
      .join(',');
  });

  return [CSV_HEADERS.map(toCsvCell).join(','), ...rows].join('\n');
}
