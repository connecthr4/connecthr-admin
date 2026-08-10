import { describe, expect, it } from 'vitest';
import { hasEmployeeUpdates, toUpdateEmployeeRequest } from './toUpdateEmployeeRequest';
import type { EmployeeDraft } from './types';

const original: EmployeeDraft = {
  personalInformation: {
    firstName: 'Anto Reshma',
    lastName: 'M',
    mobileNumber: '9876543210',
    email: 'anto.m@example.com',
    dateOfBirth: '2002-01-19',
    gender: 'Female',
    nationality: 'Indian',
    maritalStatus: 'Single',
    aadhaarNumber: '123456789023',
    currentAddress: 'HSR Layout',
    currentCity: 'Bengaluru',
    currentState: '29',
    currentDistrictCode: '526',
    currentPinCode: '593843',
    sameAsCurrentAddress: true,
    permanentAddress: 'HSR Layout',
    permanentCity: 'Bengaluru',
    permanentState: '29',
    permanentDistrictCode: '526',
    permanentPinCode: '593843',
    emergencyContactName: 'Rajesh',
    emergencyRelationship: 'brother',
    emergencyPhoneNumber: '8576937592',
    emergencyAddress: 'harihar',
  },

  professionalInformation: {
    employeeID: 'EMP1023',
    employeeType: 'Full Time',
    employmentStatus: 'Active',
    dateOfJoining: '2026-08-03',
    department: 'Engineering',
  },

  payrollInformation: {
    accountHolderName: 'Anto Reshma',
    bankName: 'HDFC Bank',
    accountNumber: '1234567890123456',
    confirmAccountNumber: '1234567890123456',
    ifscCode: 'HDFC0001234',
    branchName: 'Koramangala Branch',
    panNumber: 'ABCDE1233P',
    uanNumber: '100200300400',
    esicNumber: '1234567890',
  },
};

/**
 * The draft after the user edited it, expressed as a patch on top of `original` so each test
 * states only what changed on screen.
 */
function edited(changes: {
  personalInformation?: Partial<EmployeeDraft['personalInformation']>;
  professionalInformation?: Partial<EmployeeDraft['professionalInformation']>;
  payrollInformation?: Partial<EmployeeDraft['payrollInformation']>;
}): EmployeeDraft {
  return {
    personalInformation: { ...original.personalInformation, ...changes.personalInformation },
    professionalInformation: { ...original.professionalInformation, ...changes.professionalInformation },
    payrollInformation: { ...original.payrollInformation, ...changes.payrollInformation },
  };
}

describe('toUpdateEmployeeRequest', () => {
  it('sends only the fields that changed, grouped by section', () => {
    const request = toUpdateEmployeeRequest(
      original,
      edited({
        personalInformation: { mobileNumber: '8310638592' },
        payrollInformation: { branchName: 'Indiranagar Branch' },
      })
    );

    expect(request).toEqual({
      personalInformation: { mobileNumber: '8310638592' },
      payrollInformation: { branchName: 'Indiranagar Branch' },
    });
  });

  it('leaves an untouched section out of the payload entirely', () => {
    const request = toUpdateEmployeeRequest(original, edited({ professionalInformation: { department: 'Product' } }));

    expect(request).toEqual({ professionalInformation: { department: 'Product' } });
    expect(request).not.toHaveProperty('personalInformation');
    expect(request).not.toHaveProperty('payrollInformation');
  });

  it('never sends the fields the wizard only holds for the UI', () => {
    const request = toUpdateEmployeeRequest(
      original,
      edited({
        personalInformation: { sameAsCurrentAddress: false, permanentCity: 'Mysuru' },
        professionalInformation: { employeeID: 'EMP9999', employmentStatus: 'Inactive' },
        payrollInformation: { confirmAccountNumber: '9999', accountNumber: '9999' },
      })
    );

    expect(request.personalInformation).toEqual({ permanentCity: 'Mysuru' });
    expect(request.professionalInformation).toEqual({ employmentStatus: 'Inactive' });
    expect(request.payrollInformation).toEqual({ accountNumber: '9999' });
  });

  it('treats a field the backend returned as null and the form returned as empty as unchanged', () => {
    // `email: null` is what `/employees/:id` sends for a field that was never filled in; the
    // form always hands back a string.
    const seeded = edited({ personalInformation: { email: null as unknown as string } });

    expect(toUpdateEmployeeRequest(seeded, edited({ personalInformation: { email: '' } }))).toEqual({});
  });

  it('reports an unedited draft as having nothing to update', () => {
    const request = toUpdateEmployeeRequest(original, edited({}));

    expect(request).toEqual({});
    expect(hasEmployeeUpdates(request)).toBe(false);
  });

  it('reports a single changed field as having something to update', () => {
    expect(hasEmployeeUpdates(toUpdateEmployeeRequest(original, edited({ personalInformation: { email: '' } })))).toBe(
      true
    );
  });
});
