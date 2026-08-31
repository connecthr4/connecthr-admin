/**
 * The three section shapes live with the API contract, since they are what the create
 * endpoint accepts — the store just holds one of each while the wizard is in progress.
 */
export type { PersonalInformation, ProfessionalInformation, PayrollInformation } from '@/src/lib/types/employees';

import type { PersonalInformation, ProfessionalInformation, PayrollInformation } from '@/src/lib/types/employees';

/**
 * The professional step also shows the backend-assigned Employee ID as a read-only field.
 * It is held here so the form can render it, but it is not part of the create payload —
 * `EmployeeWizard` picks the contract fields out of this when it submits.
 */
export interface ProfessionalInformationDraft extends ProfessionalInformation {
  employeeID: string;
}

/**
 * Every section the wizard holds, as one value. Editing an existing employee seeds all
 * three at once — see `setEmployeeData`.
 */
export interface EmployeeDraft {
  personalInformation: PersonalInformation;
  professionalInformation: ProfessionalInformationDraft;
  payrollInformation: PayrollInformation;
}

/**
 * The four uploads the documents step collects, in the order they are laid out.
 */
export const EMPLOYEE_DOCUMENT_TYPES = [
  'appointmentLetter',
  'salarySlips',
  'relievingLetter',
  'experienceLetter',
] as const;

export type EmployeeDocumentType = (typeof EMPLOYEE_DOCUMENT_TYPES)[number];

/**
 * What the documents step holds: the `File` the browser handed us, kept as-is.
 *
 * @remarks
 * There is no upload endpoint yet, so a picked file lives here — in memory, for as long as
 * the wizard is open — and is dropped again with the rest of the draft. Once files are
 * stored remotely this becomes the uploaded reference and nothing outside this slice and
 * `DocumentUpload` has to change.
 *
 * Deliberately not part of {@link EmployeeDraft}: that shape is what the create payload is
 * built from and what an edit is diffed against, and a `File` belongs in neither.
 */
export type EmployeeDocuments = Record<EmployeeDocumentType, File | null>;

export interface EmployeeStoreState extends EmployeeDraft {
  documents: EmployeeDocuments;

  setPersonalInformation: (data: Partial<PersonalInformation>) => void;
  setProfessionalInformation: (data: Partial<ProfessionalInformationDraft>) => void;
  setPayrollInformation: (data: Partial<PayrollInformation>) => void;

  /**
   * Attaches a file to one of the document slots, or clears it again with `null` — the
   * remove button and a rejected pick both take the second form.
   */
  setDocument: (type: EmployeeDocumentType, file: File | null) => void;

  /**
   * Replaces the whole draft in a single update, so seeding the wizard from a fetched
   * record notifies subscribers once instead of once per section.
   */
  setEmployeeData: (data: EmployeeDraft) => void;

  resetEmployeeData: () => void;
}
