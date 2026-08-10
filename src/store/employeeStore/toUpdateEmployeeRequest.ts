/**
 * Turns the wizard's draft into the PATCH body `/employees/:id` expects.
 *
 * The endpoint is a partial update, so the payload is built by diffing the draft against the
 * record it was seeded from (`fromEmployeeDetail`): a section the user walked past without
 * touching is left out entirely, and a section they did edit carries only the fields that
 * actually changed. Both sides are compared *after* that mapping, so the normalisation it
 * performs — dates truncated to "YYYY-MM-DD" — never registers as an edit of its own.
 */

import type { UpdateEmployeeRequest } from '@/src/lib/types/employees';
import type { EmployeeDraft } from './types';

/**
 * Fields the wizard holds for the UI's sake but the write model has no place for: the
 * address shortcut is inferred rather than stored, the confirmation is only there to be
 * matched against the account number, and the Employee ID is assigned by the backend and
 * shown read-only.
 */
const NON_WRITABLE_FIELDS = new Set(['sameAsCurrentAddress', 'confirmAccountNumber', 'employeeID']);

/**
 * A field the backend has no value for comes back as `null` while the form always hands back
 * `''`, so the two are treated as the same absent value — otherwise merely stepping through
 * an untouched section would report every empty field as changed.
 */
function isUnchanged(original: unknown, current: unknown): boolean {
  if (original === current) return true;

  return (original ?? '') === (current ?? '');
}

/**
 * @returns The changed fields, or `undefined` when the section is untouched — which is what
 * keeps the section out of the payload rather than sending it as an empty object.
 */
function diffSection<T extends object>(original: T, current: T): Partial<T> | undefined {
  const changes = Object.entries(current).filter(
    ([key, value]) => !NON_WRITABLE_FIELDS.has(key) && !isUnchanged(original[key as keyof T], value)
  );

  if (changes.length === 0) return undefined;

  return Object.fromEntries(changes) as Partial<T>;
}

export function toUpdateEmployeeRequest(original: EmployeeDraft, current: EmployeeDraft): UpdateEmployeeRequest {
  const personalInformation = diffSection(original.personalInformation, current.personalInformation);
  const professionalInformation = diffSection(original.professionalInformation, current.professionalInformation);
  const payrollInformation = diffSection(original.payrollInformation, current.payrollInformation);

  return {
    ...(personalInformation && { personalInformation }),
    ...(professionalInformation && { professionalInformation }),
    ...(payrollInformation && { payrollInformation }),
  };
}

/**
 * Whether the request carries anything at all, so the caller can skip a round trip that
 * would ask the backend to change nothing.
 */
export function hasEmployeeUpdates(request: UpdateEmployeeRequest): boolean {
  return Object.keys(request).length > 0;
}
