/**
 * The option lists a form field is filled from, as `/options/{module}/{field}` serves them.
 *
 * The backend owns these lists, so a dropdown reads them rather than declaring its own: the
 * create and update endpoints reject a value outside the set they return.
 */

import type { DropdownOption } from '@/src/components/Dropdown/Dropdown';

/**
 * The employee fields the options endpoint serves. Kept as a closed set because the field
 * becomes part of the request path, and a Server Function's arguments arrive from the
 * browser.
 */
export const EMPLOYEE_OPTION_FIELDS = ['department', 'gender', 'maritalStatus'] as const;

export type EmployeeOptionField = (typeof EMPLOYEE_OPTION_FIELDS)[number];

/**
 * One field's list. `options` already carries the `label`/`value` pairs a Dropdown takes,
 * so nothing has to be mapped on the way through.
 *
 * `label` is the field's own display name and `isMulti` says whether the backend accepts
 * more than one value for it — neither is used by the employee forms, which render their
 * own labels and take a single value, but both are kept so the shape stays faithful to the
 * response.
 */
export interface FieldOptions {
  id: string;
  label: string;
  isMulti: boolean;
  options: DropdownOption[];
}

export interface GetFieldOptionsResponse {
  success: boolean;
  message: string;
  data: FieldOptions;
}

/**
 * Mirrors the other Server Function results — a plain, serializable outcome, since a Server
 * Function cannot carry `ApiError` across the client/server boundary intact.
 */
export type GetFieldOptionsResult = { success: true; data: FieldOptions } | { success: false; message: string };
