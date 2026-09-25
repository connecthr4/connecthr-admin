/**
 * The shapes the separation module works in: the lists its dropdowns offer, what filing a
 * separation sends, and what comes back.
 *
 * Field names match the backend's JSON exactly, so the form's values go out as they are
 * rather than through a mapping layer that could drift from the contract.
 */

import type { DropdownOption } from '@/src/components/Dropdown/Dropdown';
import type { Employee } from './employees';

/**
 * A separation type as the backend names it — `"RESIGNATION"`, `"END_OF_CONTRACT"` and so
 * on, never the label shown beside it.
 *
 * Deliberately a bare `string`: the list is served by `/separations/options`, so writing the
 * codes out here as a union would be a second source of truth that could only ever fall
 * behind it. The dropdown cannot submit a value that was not on the list it was filled from.
 */
export type SeparationType = string;

/**
 * Everything the separation form's dropdowns offer, in one read.
 *
 * `separationTypes` already carries the `label`/`value` pairs a Dropdown takes, so nothing
 * has to be mapped on the way through.
 */
export interface SeparationOptions {
  separationTypes: DropdownOption[];
}

export interface GetSeparationOptionsResponse {
  success: boolean;
  message: string;
  data: SeparationOptions;
}

/**
 * Mirrors the other Server Function results — a plain, serializable outcome, since a Server
 * Function cannot carry an `ApiError` across the client/server boundary intact.
 */
export type GetSeparationOptionsResult =
  | { success: true; data: SeparationOptions }
  | { success: false; message: string };

/**
 * A single employee, reduced to what the separation drawer shows about them: who it is
 * filing against, and nothing more. The drawer opens over the employee list, so the row the
 * user picked is still on screen behind it and the panel has no reason to repeat their
 * department, designation or start date back at them.
 */
export interface SeparationEmployee {
  /** The record's own id — kept because the list is keyed on it, not sent. */
  id: string;

  /**
   * The human-readable identifier ("EMP0007"), which is what the user recognises — and what
   * `POST /separations` takes as its `employeeId`.
   */
  employeeId: string;
  name: string;
  avatar: string;
}

/**
 * What filing a separation sends — the body of `POST /separations`, verbatim.
 *
 * Dates are `"YYYY-MM-DD"`, as everywhere else in the app, and it goes out as JSON: the
 * endpoint takes no attachment, so there is nothing here that would need multipart.
 */
export interface InitiateSeparationRequest {
  /** The "EMP1032" code, not the record id — this is what the endpoint matches on. */
  employeeId: string;
  separationType: SeparationType;
  resignationDate: string;

  /** Days, already parsed out of the text field. */
  noticePeriodDays: number;
  lastWorkingDate: string;
  reason: string;

  /** Left off entirely when the optional field was not filled in. */
  notes?: string;
}

export interface InitiateSeparationResponse {
  success: boolean;

  /**
   * What the user is shown on success. Taken from the response rather than written here, so
   * the screen reports what the backend actually recorded.
   */
  message: string;
}

/**
 * The outcome of filing a separation, as the form receives it.
 *
 * Server Functions can't let custom error classes cross the client/server boundary, so both
 * outcomes travel through this plain result rather than a throw. The message is carried
 * either way — the backend's own wording on success, and its error wording on failure.
 */
export interface InitiateSeparationResult {
  success: boolean;
  message: string;
}

/**
 * Where a filed separation has got to.
 *
 * Unlike {@link SeparationType} this *is* a union, and the one place the app reads a
 * separation's state as a value rather than as text: the badge has to pick a colour per
 * state, and an unlisted code would have to be given one anyway. The set is taken from the
 * `statusCounts` the list endpoint returns, which is keyed by exactly these four.
 *
 * The *wording* is never derived from it — every response carries its own `statusLabel`
 * ("Pending Approval", not "Pending"), and that is what is rendered.
 */
export type SeparationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';

/**
 * What the signed-in user may do with this separation, as decided by the backend.
 *
 * `canDecide` is what the details drawer renders its Approve and Reject buttons off. It is
 * computed by the same predicates the write path enforces, so it already answers both rules
 * the endpoints apply — that deciding is restricted to the roles above ADMIN, and that nobody
 * may decide a separation they raised themselves. Nothing on this side re-derives either, and
 * a UI that tried to would only be a second opinion that could disagree.
 *
 * `canWithdraw` is carried through and still unused: there is no withdraw endpoint wired up.
 */
export interface SeparationPermissions {
  canDecide: boolean;
  canWithdraw: boolean;
}

/**
 * The body both decide endpoints take.
 *
 * One shape for the two, because it is one field either way — what differs is whether it may
 * be left out, which is {@link SeparationDecisionOutcome}'s business rather than the type's:
 * `PATCH /separations/:id/approve` treats `remarks` as optional, and
 * `PATCH /separations/:id/reject` requires between 1 and 1000 characters of it.
 */
export interface DecideSeparationRequest {
  remarks?: string;
}

/**
 * Which way a separation was decided, and so also the status it ends up in.
 *
 * Narrowed from {@link SeparationStatus} rather than written as its own `'APPROVE' | 'REJECT'`
 * pair, so the outcome picked in the UI *is* the status the row lands on — nothing has to be
 * mapped between the button and the badge.
 */
export type SeparationDecisionOutcome = Extract<SeparationStatus, 'APPROVED' | 'REJECTED'>;

/**
 * What the decide endpoints answer with.
 *
 * `data` is optional: the contract does not pin down whether the decided record comes back,
 * so the screen uses it when it is there and stands the row in for itself when it is not,
 * rather than depending on a field that may not arrive.
 */
export interface DecideSeparationResponse {
  success: boolean;
  message: string;
  data?: SeparationDetail;
}

/**
 * Mirrors the other Server Function results — a plain, serializable outcome, since a Server
 * Function cannot carry an `ApiError` across the client/server boundary intact.
 *
 * The message is carried on both paths, so the backend's own wording is what the approver is
 * shown — including the wording behind a refused decision, which is the case most worth
 * reporting verbatim.
 */
export interface DecideSeparationResult {
  success: boolean;
  message: string;
  data?: SeparationDetail;
}

/**
 * The employee a separation was filed against, as the list nests them on each row.
 *
 * `avatar` and `designation` are nullable — an employee with no photo uploaded, and one
 * whose designation was never recorded — so everything that renders them has a stand-in.
 */
export interface SeparationListEmployee {
  /** The employee's record id. */
  id: string;

  /** The "EMP1042" code the user recognises. */
  employeeId: string;
  name: string;
  avatar: string | null;
  department: string;
  designation: string | null;
}

/**
 * One row of `GET /separations`.
 *
 * Deliberately *not* the whole submission: the list omits `reason`, `notes`, `raisedBy` and
 * the decision, which is what keeps a page of rows small. Those arrive from
 * {@link SeparationDetail} when a row is opened — see `SeparationsClient`.
 */
export interface SeparationListItem {
  /** The separation's own id — what the list is keyed on, and what the detail read takes. */
  id: string;
  employee: SeparationListEmployee;
  status: SeparationStatus;

  /** The backend's own wording for {@link status}, which is what the badge renders. */
  statusLabel: string;
  separationType: SeparationType;
  separationTypeLabel: string;

  /** "YYYY-MM-DD", as everywhere else in the app. */
  resignationDate: string;
  lastWorkingDate: string;
  noticePeriodDays: number;

  /** ISO timestamp of when the separation was filed. */
  raisedAt: string;

  /** ISO timestamp of the decision, or null while the separation is still pending. */
  decidedAt: string | null;
  permissions: SeparationPermissions;
}

/**
 * Same shape as the employee list's meta. Kept as its own type rather than imported from
 * there: the two endpoints happen to page alike, which is not a reason to couple them.
 */
export interface SeparationListMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * How many separations sit in each state, across the whole list rather than the page on
 * screen.
 *
 * `Partial`, because a state with nothing in it may reasonably be omitted rather than sent
 * as a zero — reading a missing key as "none" is right either way.
 */
export type SeparationStatusCounts = Partial<Record<SeparationStatus, number>>;

/**
 * The list's query string. Page and size only for now: the endpoint documents no search,
 * sort or status filter, so nothing here invents one.
 */
export interface GetSeparationsRequest {
  page: number;
  limit: number;
}

export interface GetSeparationsResponse {
  success: boolean;
  message: string;
  data: {
    separations: SeparationListItem[];
    meta: SeparationListMeta;
    statusCounts: SeparationStatusCounts;
  };
}

/**
 * Mirrors the other Server Function results — a plain, serializable outcome, since a Server
 * Function cannot carry an `ApiError` across the client/server boundary intact.
 *
 * The payload is flattened out of the response's `data` envelope here, so callers read
 * `result.separations` rather than `result.data.separations`.
 */
export type GetSeparationsResult =
  | {
      success: true;
      separations: SeparationListItem[];
      meta: SeparationListMeta;
      statusCounts: SeparationStatusCounts;
    }
  | { success: false; message: string };

/**
 * The employee as the *detail* read nests them — the list's fields plus their current
 * employment status.
 */
export interface SeparationDetailEmployee extends SeparationListEmployee {
  employmentStatus: string;
}

/**
 * Whoever filed the separation, or decided it. Not the employee leaving: separations are
 * filed by an admin from the employee list.
 */
export interface SeparationActor {
  id: string;
  name: string;
  role: string;
}

/**
 * The outcome of a decided separation.
 *
 * Every field is optional and nullable, because the only example of this the API contract
 * shows is `null` — the shape when a separation *has* been decided is not yet pinned down.
 * The panel renders whichever of these it is actually given and omits the rest, so a shape
 * that turns out to differ degrades to showing less rather than to a crash. Worth replacing
 * with an exact interface once the decided shape is confirmed.
 */
export interface SeparationDecision {
  status?: SeparationStatus;
  statusLabel?: string;
  decidedBy?: SeparationActor | null;

  /** ISO timestamp. Also present on the list row as `decidedAt`. */
  decidedAt?: string | null;
  comment?: string | null;
  reason?: string | null;
}

/**
 * One separation in full, from `GET /separations/:separationId` — the list row plus
 * everything the row leaves out.
 */
export interface SeparationDetail {
  id: string;
  employee: SeparationDetailEmployee;
  status: SeparationStatus;
  statusLabel: string;
  separationType: SeparationType;
  separationTypeLabel: string;
  resignationDate: string;
  noticePeriodDays: number;
  lastWorkingDate: string;

  /** The free text the form collected. The reason the list cannot show. */
  reason: string;

  /** Null when the optional notes field was left empty. */
  notes: string | null;
  raisedBy: SeparationActor | null;

  /** ISO timestamp of when the separation was filed. */
  raisedAt: string;

  /** Null while the separation is still pending. */
  decision: SeparationDecision | null;
  permissions: SeparationPermissions;
}

export interface GetSeparationResponse {
  success: boolean;
  message: string;
  data: SeparationDetail;
}

export type GetSeparationResult = { success: true; data: SeparationDetail } | { success: false; message: string };

/**
 * `GET /separations/employee/:employeeId` — the same record as
 * {@link GetSeparationResponse}, for an employee who may not have one.
 *
 * `data` is nullable here and not there: asking by separation id is asking after a record
 * that was already known to exist, while asking by employee is also asking *whether* there
 * is one. Most employees have never had a separation filed, so "none" is the ordinary
 * answer rather than an edge case.
 */
export interface GetEmployeeSeparationResponse {
  success: boolean;
  message: string;
  data: SeparationDetail | null;
}

/**
 * Three outcomes rather than two, because "this employee has no separation" is not a
 * failure and must not be shown as one: `data: null` is an empty section, while
 * `success: false` is the panel that offers a retry.
 */
export type GetEmployeeSeparationResult =
  | { success: true; data: SeparationDetail | null }
  | { success: false; message: string };

/**
 * Narrows a row of the employee list to what the separation form shows.
 *
 * @remarks
 * Who they are and nothing else: the drawer opens over the list, so the row being separated
 * is still on screen behind it and the panel does not need to repeat their department and
 * designation back at them. Everything here comes off that row, which is what lets the
 * drawer open on the click with nothing to fetch.
 *
 * @param employee - The row the separation action was triggered from.
 * @returns The employee, as the separation form takes them.
 */
export function toSeparationEmployee(employee: Employee): SeparationEmployee {
  return {
    id: employee.id,
    employeeId: employee.employeeId,
    name: employee.name,
    avatar: employee.avatar,
  };
}
