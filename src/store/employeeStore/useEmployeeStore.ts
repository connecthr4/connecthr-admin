/**
 * ustand store responsible for managing employee form data across the multi-step employee creation workflow.
 *
 */

import { create } from 'zustand';
import { EmployeeStoreState } from './types';

const initialState = {
  personalInformation: {
    firstName: '',
    lastName: '',
    mobileNumber: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    maritalStatus: '',
    aadhaarNumber: '',
    currentAddress: '',
    currentCity: '',
    currentState: '',
    currentDistrictCode: '',
    currentPinCode: '',
    sameAsCurrentAddress: false,
    permanentAddress: '',
    permanentCity: '',
    permanentState: '',
    permanentDistrictCode: '',
    permanentPinCode: '',
    emergencyContactName: '',
    emergencyRelationship: '',
    emergencyPhoneNumber: '',
    emergencyAddress: '',
  },

  professionalInformation: {
    employeeID: '',
    employeeType: '',
    employmentStatus: 'Active',
    dateOfJoining: '',
    department: '',
    shiftCode: '',
  },

  payrollInformation: {
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    branchName: '',
    panNumber: '',
    uanNumber: '',
    esicNumber: '',
  },

  /*
  Spelled out rather than derived from EMPLOYEE_DOCUMENT_TYPES, so adding a slot to that
  list is a type error here instead of a silently missing key.
  */
  documents: {
    appointmentLetter: null,
    salarySlips: null,
    relievingLetter: null,
    experienceLetter: null,
  },
};

export const useEmployeeStore = create<EmployeeStoreState>((set) => ({
  ...initialState,

  setPersonalInformation: (data) =>
    set((state) => ({
      personalInformation: {
        ...state.personalInformation,
        ...data,
      },
    })),

  setProfessionalInformation: (data) =>
    set((state) => ({
      professionalInformation: {
        ...state.professionalInformation,
        ...data,
      },
    })),

  setPayrollInformation: (data) =>
    set((state) => ({
      payrollInformation: {
        ...state.payrollInformation,
        ...data,
      },
    })),

  setDocument: (type, file) =>
    set((state) => ({
      documents: {
        ...state.documents,
        [type]: file,
      },
    })),

  setEmployeeData: (data) => set(data),

  resetEmployeeData: () =>
    set({
      ...initialState,
    }),
}));
