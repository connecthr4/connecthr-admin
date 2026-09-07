import { STRINGS } from './strings';
import type { AttendanceEntry, AttendanceSortOrder, AttendanceStatus } from '../lib/types/attendance';
import type { DropdownOption } from '../components/Dropdown/Dropdown';

/**
 * How the sheet is ordered. Fixed rather than a column the user can sort on:
 * a marking sheet is worked through top to bottom, and an order that moved
 * between pages would cost the user their place in it.
 */
export const ATTENDANCE_SHEET_SORT_BY = 'employeeId';
export const ATTENDANCE_SHEET_SORT_ORDER: AttendanceSortOrder = 'asc';

/** Where the sheet starts, and what "Reset" and a fresh scope go back to. */
export const ATTENDANCE_PAGE_SIZE = 10;

/**
 * What the status dropdown offers when `/attendance/options` could not be
 * read.
 *
 * The live list is the endpoint's — these are only a floor, kept in the values
 * and the order it returns them in. Departments and shifts can degrade to
 * "All", which still leaves a usable screen; a status dropdown with nothing in
 * it would leave the sheet unmarkable, so it degrades to this instead.
 */
export const FALLBACK_ATTENDANCE_STATUS_OPTIONS: (DropdownOption & { value: AttendanceStatus })[] = [
  { label: STRINGS.PRESENT, value: 'PRESENT' },
  { label: STRINGS.ON_LEAVE, value: 'ON_LEAVE' },
  { label: STRINGS.HALF_DAY_FIRST_HALF, value: 'HALF_DAY_FIRST_HALF' },
  { label: STRINGS.HALF_DAY_SECOND_HALF, value: 'HALF_DAY_SECOND_HALF' },
];

/**
 * What an untouched row holds. A shared frozen object rather than a factory:
 * entries are only ever replaced, never mutated in place, so every unmarked
 * row can point at this one instead of allocating its own.
 */
export const EMPTY_ATTENDANCE_ENTRY: AttendanceEntry = Object.freeze({
  status: '',
  overtimeHours: '',
  overtimeMinutes: '',
  remarks: '',
});

/**
 * Overtime is a duration within a single day, so the hours field stops at 23
 * and the minutes field rolls over at 59 rather than being allowed to state
 * the same span two different ways.
 */
export const MAX_OVERTIME_HOURS = 23;
export const MAX_OVERTIME_MINUTES = 59;

/** Both overtime fields are two digits — "07", "45". */
export const OVERTIME_FIELD_LENGTH = 2;

export const MINUTES_PER_HOUR = 60;
