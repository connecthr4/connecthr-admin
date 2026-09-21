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
