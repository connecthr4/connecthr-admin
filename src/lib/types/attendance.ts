/**
 * Shared shapes for the attendance module.
 */

import type { Shift } from './shifts';

/**
 * What the Mark Attendance screen is scoped to. The date is the API's
 * "YYYY-MM-DD" form rather than a `Date`, so it survives being put in a URL or
 * a request body unchanged and never picks up a timezone on the way.
 */
export interface MarkAttendanceFilters {
  date: string;

  /**
   * A department name, or {@link ALL_DEPARTMENTS} for "don't narrow by
   * department" — the dropdown needs a value for its own option list, and an
   * empty string would be indistinguishable from "nothing chosen yet".
   */
  department: string;

  /** A shift code, or {@link ALL_SHIFTS}, on the same terms as the department. */
  shift: string;
}

/**
 * The head count for one day, as the summary cards read it.
 *
 * Every count is nullable so the cards can render "--" for a day that has not
 * been loaded rather than a `0` that would claim nobody is present. The sheet's
 * own {@link AttendanceSheetSummary} is a non-null superset of this, so a
 * loaded day can be handed straight to the cards.
 */
export interface AttendanceSummary {
  totalEmployees: number | null;
  present: number | null;
  absent: number | null;
  halfDay: number | null;
  onLeave: number | null;
}

/** The sentinel the department dropdown uses for its unnarrowed option. */
export const ALL_DEPARTMENTS = 'all';

/** The same, for the shift dropdown. */
export const ALL_SHIFTS = 'all';

/** No counts at all — what the cards render before any day has been loaded. */
export const EMPTY_ATTENDANCE_SUMMARY: AttendanceSummary = {
  totalEmployees: null,
  present: null,
  absent: null,
  halfDay: null,
  onLeave: null,
};

/**
 * How one employee's day is marked — "PRESENT", "ON_LEAVE" and so on.
 *
 * A half day is a status of its own rather than a `HALF_DAY` plus a separate
 * "which half" field: one value per row is all the payload — or a draft — ever
 * has to carry.
 *
 * Typed as a string rather than a union, for the same reason
 * {@link AttendanceState} is: the values come from `/attendance/options` at
 * runtime, so a status the backend adds must not narrow to `never` here and
 * take the build down with it.
 */
export type AttendanceStatus = string;

/**
 * One status the sheet may be marked with, as the options endpoint lists it.
 * `value` is what a marking carries; `label` is what the dropdown shows.
 */
export interface AttendanceStatusOption {
  label: string;
  value: string;
}

/**
 * Everything the module's dropdowns offer, in one read.
 *
 * Departments arrive as bare names rather than `{ label, value }` pairs — they
 * are what `GetAttendanceSheetRequest.departments` is matched on, so the name
 * is both halves of the option.
 */
export interface AttendanceOptions {
  statuses: AttendanceStatusOption[];
  shifts: Shift[];
  departments: string[];
}

export interface GetAttendanceOptionsResponse {
  success: boolean;
  message: string;
  data: AttendanceOptions;
}

/**
 * One row of the marking sheet, as the table edits it.
 *
 * The overtime pair is kept as the strings the two fields hold rather than as
 * a number of minutes: a half-typed "1" and an emptied field are different
 * states the user can see, and both would collapse to `0` on the way through a
 * number. They are converted once, at submit — see `toOvertimeMinutes`.
 */
export interface AttendanceEntry {
  /** Empty until the user picks one, which is what "not marked" means. */
  status: AttendanceStatus | '';
  overtimeHours: string;
  overtimeMinutes: string;
  remarks: string;
}

/** Every marked row of a day, keyed by the employee's `id`. */
export type AttendanceEntries = Record<string, AttendanceEntry>;

/**
 * The employee columns the marking sheet reads. Narrower than the list
 * `Employee` on purpose — the sheet shows who is being marked, not the whole
 * employee record.
 */
export interface MarkAttendanceEmployee {
  id: string;
  employeeId: string;
  name: string;
  department: string;

  /**
   * The shift's display name — `null` for an employee the backend has not put
   * on one, which the column renders as a dash.
   */
  shift?: string | null;
}

/**
 * The overtime a submitted record carries — the two fields as the user typed
 * them, not a total. The endpoint takes the pair, so nothing is added up on the
 * way out and nothing has to be split apart on the way back in.
 */
export interface MarkAttendanceOvertime {
  hours: number;
  minutes: number;
}

/** One employee's marking, in the shape `POST /attendance/submit` takes. */
export interface MarkAttendanceRecord {
  /**
   * The backend's own employee record id — the `employeeId` of a sheet row, not
   * the "EMP1001" code the sheet displays.
   */
  employeeId: string;
  status: AttendanceStatus;
  overtime: MarkAttendanceOvertime;
  remarks: string;
}

/** A whole day's markings, as they are submitted. */
export interface MarkAttendanceRequest {
  /** "YYYY-MM-DD" — the day every record in the payload belongs to. */
  date: string;
  records: MarkAttendanceRecord[];
}

export interface SubmitAttendanceResponse {
  success: boolean;

  /**
   * What the user is shown on success. Taken from the response rather than
   * written here, so the screen reports what the backend actually recorded.
   */
  message: string;
}

/**
 * What a saved draft came to. The counted rows are the backend's own tally of
 * what it stored, which is what makes the confirmation worth showing: it says
 * the day was saved *and* how much of it.
 */
export interface AttendanceDraftSummary {
  date: string;

  /** "DRAFT" for a day saved this way — the state the sheet will read back. */
  state: AttendanceState;
  savedCount: number;
}

export interface SaveAttendanceDraftResponse {
  success: boolean;
  message: string;
  data: AttendanceDraftSummary;
}

/**
 * How the two attendance writes report back.
 *
 * Server Functions can't let custom error classes cross the client/server
 * boundary, so both outcomes travel through this plain result instead of a
 * throw. The message is carried either way — the backend's own wording on
 * success, and its error wording on failure.
 */
export interface AttendanceWriteResult {
  success: boolean;
  message: string;
}

/**
 * The body `POST /attendance/sheet` takes.
 *
 * `date` is the only required field — the sheet is always a single day — and
 * every filter is left off entirely when it does not narrow anything, so an
 * unfiltered request is the smallest one the backend can be asked to plan.
 */
export interface GetAttendanceSheetRequest {
  /** "YYYY-MM-DD". Defaults to today at the call site, never on the backend. */
  date: string;

  /** Department *names*, as `/attendance/options` offers them. The backend ORs them. */
  departments?: string[];

  /**
   * Shift *codes* — the `code` half of an option, which is what a sheet row
   * carries as its `shiftCode`. ORed the same way.
   */
  shifts?: string[];

  /** Matched against employee name and code. */
  search?: string;

  /** One-based. */
  page?: number;
  limit?: number;

  sortBy?: string;
  sortOrder?: AttendanceSortOrder;
}

export type AttendanceSortOrder = 'asc' | 'desc';

/**
 * How far along a day's marking is. Sent for the sheet as a whole and for each
 * row, where `null` means the row has not been marked at all.
 *
 * Typed as a string rather than a union: the screen only ever displays what it
 * is given, and a state the backend adds later must not narrow to `never` here
 * and take the build down with it.
 */
export type AttendanceState = string;

/**
 * One row's overtime, pre-formatted by the backend. The sheet edits the
 * `hours`/`minutes` pair; `totalMinutes` is what a submission carries and
 * `label` is the rendered form the export can reuse.
 */
export interface AttendanceOvertime {
  hours: number;
  minutes: number;
  totalMinutes: number;
  label: string;
}

/**
 * The day's head count, as the sheet reports it. A superset of
 * {@link AttendanceSummary} — every count is a real number here, since a
 * response is by definition a day that has been loaded.
 */
export interface AttendanceSheetSummary {
  totalEmployees: number;
  present: number;
  absent: number;
  halfDay: number;
  onLeave: number;

  /** Everyone still to be marked — `totalEmployees` less the four above. */
  notMarked: number;
}

/**
 * One employee's row on the sheet, carrying both who they are and whatever has
 * already been marked for them on that day.
 *
 * Note the two identifiers: `employeeId` is the backend's own record id, and
 * `employeeCode` is the "EMP1001" the sheet shows and keys its markings by.
 */
export interface AttendanceSheetRow {
  employeeId: string;
  employeeCode: string;
  name: string;
  department: string;

  shiftCode: string | null;
  shift: string | null;

  /** `null` until the day is marked for this employee. */
  status: AttendanceStatus | null;
  statusLabel: string | null;

  overtime: AttendanceOvertime;
  remarks: string | null;
  state: AttendanceState | null;
}

export interface AttendanceSheetMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * One page of a day's sheet. The summary counts the *whole* day, not the page:
 * it is the day's standing, so it does not move as the user pages through.
 */
export interface AttendanceSheet {
  date: string;
  state: AttendanceState;
  summary: AttendanceSheetSummary;
  rows: AttendanceSheetRow[];
  meta: AttendanceSheetMeta;
}

export interface GetAttendanceSheetResponse {
  success: boolean;
  message: string;
  data: AttendanceSheet;
}

/**
 * Server Functions can't let custom error classes (e.g. `ApiError`) cross the
 * client/server boundary intact, so `getAttendanceSheet` reports failure
 * through this plain, serializable result instead of throwing.
 */
export type GetAttendanceSheetResult = { success: true; data: AttendanceSheet } | { success: false; message: string };
