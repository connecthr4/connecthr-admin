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

export interface EmployeeStoreState extends EmployeeDraft {
  setPersonalInformation: (data: Partial<PersonalInformation>) => void;
  setProfessionalInformation: (data: Partial<ProfessionalInformationDraft>) => void;
  setPayrollInformation: (data: Partial<PayrollInformation>) => void;

  /**
   * Replaces the whole draft in a single update, so seeding the wizard from a fetched
   * record notifies subscribers once instead of once per section.
   */
  setEmployeeData: (data: EmployeeDraft) => void;

  resetEmployeeData: () => void;
}
