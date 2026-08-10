import { describe, expect, it } from 'vitest';
import { fromEmployeeDetail } from './fromEmployeeDetail';
import type { EmployeeDetail } from '@/src/lib/types/employees';

const employee: EmployeeDetail = {
  id: '9f1c2b6a-0000-4c1f-9a5e-1d2f3a4b5c6d',
  employeeId: 'EMP001',
  avatar: 'https://example.com/avatar.png',
  name: 'Brooklyn Simmons',
  personalInformation: {
    firstName: 'Brooklyn',
    lastName: 'Simmons',
    mobileNumber: '9876543210',
    email: 'brooklyn.s@example.com',
    dateOfBirth: '1992-07-10',
    gender: 'Female',
    nationality: 'Indian',
    maritalStatus: 'Single',
    aadhaarNumber: '123456789012',
    currentAddress: '2464 Royal Ln.',
    currentCity: 'Bengaluru',
    currentState: 'KA',
    currentDistrict: 'Bengaluru Urban',
    currentDistrictCode: '525',
    currentPinCode: '560001',
    permanentAddress: '12 Church Street',
    permanentCity: 'Mysuru',
    permanentState: 'KA',
    permanentDistrict: 'Mysuru',
    permanentDistrictCode: '531',
    permanentPinCode: '570001',
    emergencyContactName: 'Robert Simmons',
    emergencyRelationship: 'Father',
    emergencyPhoneNumber: '9123456789',
    emergencyAddress: '12 Church Street, Mysuru',
  },
  professionalInformation: {
    employeeType: 'Full Time',
    employmentStatus: 'Active',
    dateOfJoining: '2023-04-01',
    department: 'Engineering',
    designation: 'Project Manager',
    workMode: 'Office',
  },
  payrollInformation: {
    accountHolderName: 'Brooklyn Simmons',
    bankName: 'HDFC Bank',
    accountNumber: '1234567890123456',
    ifscCode: 'HDFC0001234',
    branchName: 'Koramangala Branch',
    panNumber: 'ABCDE1234F',
    uanNumber: '100200300400',
    esicNumber: '1234567890',
  },
  createdAt: '2023-04-01T10:00:00.000Z',
  updatedAt: '2024-01-01T10:00:00.000Z',
};

describe('fromEmployeeDetail', () => {
  it('maps every section of the record onto the wizard draft', () => {
    const draft = fromEmployeeDetail(employee);

    expect(draft.personalInformation).toMatchObject({
      firstName: 'Brooklyn',
      dateOfBirth: '1992-07-10',
      currentState: 'KA',
      currentDistrictCode: '525',
      emergencyContactName: 'Robert Simmons',
    });

    expect(draft.professionalInformation).toEqual({
      employeeID: 'EMP001',
      employeeType: 'Full Time',
      employmentStatus: 'Active',
      dateOfJoining: '2023-04-01',
      department: 'Engineering',
    });

    expect(draft.payrollInformation.accountHolderName).toBe('Brooklyn Simmons');
  });

  it('leaves out the fields that only exist on a read', () => {
    const draft = fromEmployeeDetail(employee);

    expect(draft.personalInformation).not.toHaveProperty('currentDistrict');
    expect(draft.personalInformation).not.toHaveProperty('permanentDistrict');
    expect(draft.professionalInformation).not.toHaveProperty('designation');
    expect(draft.professionalInformation).not.toHaveProperty('workMode');
  });

  it('seeds the confirmation field the payroll step validates against', () => {
    const draft = fromEmployeeDetail(employee);

    expect(draft.payrollInformation.confirmAccountNumber).toBe(draft.payrollInformation.accountNumber);
  });

  it('keeps the calendar day of a date returned as a timestamp', () => {
    const draft = fromEmployeeDetail({
      ...employee,
      personalInformation: { ...employee.personalInformation, dateOfBirth: '1992-07-10T00:00:00.000Z' },
    });

    expect(draft.personalInformation.dateOfBirth).toBe('1992-07-10');
  });

  it('ticks "same as current address" only when both addresses match', () => {
    expect(fromEmployeeDetail(employee).personalInformation.sameAsCurrentAddress).toBe(false);

    const sameAddress = fromEmployeeDetail({
      ...employee,
      personalInformation: {
        ...employee.personalInformation,
        permanentAddress: employee.personalInformation.currentAddress,
        permanentCity: employee.personalInformation.currentCity,
        permanentState: employee.personalInformation.currentState,
        permanentDistrictCode: employee.personalInformation.currentDistrictCode,
        permanentPinCode: employee.personalInformation.currentPinCode,
      },
    });

    expect(sameAddress.personalInformation.sameAsCurrentAddress).toBe(true);
  });
});
