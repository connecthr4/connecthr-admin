/**
 * The shapes the separation screens work in. The backend endpoints do not exist yet, so
 * `InitiateSeparationRequest` is the contract the form is written against — when the API
 * arrives, it is the one place the payload has to be reconciled with it.
 */

import type { SEPARATION_TYPES } from '@/src/constants/strings';

/** One of the types the form offers, e.g. `"Resignation"`. */
export type SeparationType = (typeof SEPARATION_TYPES)[number]['value'];

/**
 * A single employee, reduced to what the separation screen shows about them. Derived on the
 * server from the full `EmployeeDetail`, so the record's personal, payroll and bank details
 * are never serialized into the page for a screen that has no use for them.
 */
export interface SeparationEmployee {
  /** The record's own id — what the separation is filed against. */
  id: string;

  /** The human-readable identifier ("EMP0007"), which is what the user recognises. */
  employeeId: string;
  name: string;
  avatar: string;
  department: string;
  designation: string;
  dateOfJoining: string;
}

/**
 * What initiating a separation sends. Dates are `"YYYY-MM-DD"`, as everywhere else in the
 * app, and the letter is a `File` — so this goes out as multipart rather than JSON.
 */
export interface InitiateSeparationRequest {
  employeeId: string;
  separationType: SeparationType;
  resignationDate: string;

  /** Days, already parsed out of the text field. */
  noticePeriodDays: number;
  lastWorkingDate: string;
  reasonForLeaving: string;

  /** Left off entirely when the optional field was not filled in. */
  additionalNotes?: string;
  resignationLetter: File;
}
