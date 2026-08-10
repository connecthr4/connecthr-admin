/**
 * Turns the record `/employees/:id` returns into the draft the wizard edits.
 *
 * The read model and the write model are deliberately different shapes (see
 * `lib/types/employees`), so the fields that only ever come back on a read — resolved
 * district names, designation, work mode — are dropped here rather than carried into the
 * store, where they would end up in the next write payload.
 */

import { formatDisplayDate, parseLocalDate } from '@/src/utils/date';
import type { EmployeeDetail } from '@/src/lib/types/employees';
import type { EmployeeDraft } from './types';

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}/;

/**
 * The date fields speak "YYYY-MM-DD" — both in the form and in the create payload. A value
 * that already starts that way is truncated rather than parsed, so a timestamp
 * ("1992-07-10T00:00:00.000Z") keeps its calendar day instead of shifting one back for
 * viewers behind UTC.
 */
function toDateOnly(value?: string): string {
  if (!value) return '';

  if (ISO_DATE_ONLY.test(value)) return value.slice(0, 10);

  return formatDisplayDate(parseLocalDate(value));
}

/**
 * The backend stores the two addresses independently, so whether they were entered through
 * the "same as current" shortcut is inferred from the values themselves. Restoring the
 * checkbox matters beyond cosmetics: it is what keeps the permanent fields locked to the
 * current ones while the record is edited.
 */
function isSameAddress({ personalInformation: p }: EmployeeDetail): boolean {
  return (
    Boolean(p.currentAddress) &&
    p.currentAddress === p.permanentAddress &&
    p.currentCity === p.permanentCity &&
    p.currentState === p.permanentState &&
    p.currentDistrictCode === p.permanentDistrictCode &&
    p.currentPinCode === p.permanentPinCode
  );
}

export function fromEmployeeDetail(employee: EmployeeDetail): EmployeeDraft {
  const { personalInformation, professionalInformation, payrollInformation } = employee;

  return {
    personalInformation: {
      firstName: personalInformation.firstName,
      lastName: personalInformation.lastName,
      mobileNumber: personalInformation.mobileNumber,
      email: personalInformation.email,
      dateOfBirth: toDateOnly(personalInformation.dateOfBirth),
      gender: personalInformation.gender,
      nationality: personalInformation.nationality,
      maritalStatus: personalInformation.maritalStatus,
      aadhaarNumber: personalInformation.aadhaarNumber,

      currentAddress: personalInformation.currentAddress,
      currentCity: personalInformation.currentCity,
      currentState: personalInformation.currentState,
      currentDistrictCode: personalInformation.currentDistrictCode,
      currentPinCode: personalInformation.currentPinCode,

      sameAsCurrentAddress: isSameAddress(employee),

      permanentAddress: personalInformation.permanentAddress,
      permanentCity: personalInformation.permanentCity,
      permanentState: personalInformation.permanentState,
      permanentDistrictCode: personalInformation.permanentDistrictCode,
      permanentPinCode: personalInformation.permanentPinCode,

      emergencyContactName: personalInformation.emergencyContactName,
      emergencyRelationship: personalInformation.emergencyRelationship,
      emergencyPhoneNumber: personalInformation.emergencyPhoneNumber,
      emergencyAddress: personalInformation.emergencyAddress,
    },

    professionalInformation: {
      // Read-only on the step, and assigned by the backend — it lives at the root of the
      // record rather than inside its professional section.
      employeeID: employee.employeeId,
      employeeType: professionalInformation.employeeType,
      employmentStatus: professionalInformation.employmentStatus,
      dateOfJoining: toDateOnly(professionalInformation.dateOfJoining),
      department: professionalInformation.department,
    },

    payrollInformation: {
      accountHolderName: payrollInformation.accountHolderName,
      bankName: payrollInformation.bankName,
      accountNumber: payrollInformation.accountNumber,
      // Never stored, so it never comes back: seeded from the account number itself, which
      // is what the user would otherwise have to retype to get past the step.
      confirmAccountNumber: payrollInformation.accountNumber,
      ifscCode: payrollInformation.ifscCode,
      branchName: payrollInformation.branchName,
      panNumber: payrollInformation.panNumber,
      uanNumber: payrollInformation.uanNumber,
      esicNumber: payrollInformation.esicNumber,
    },
  };
}
