export interface PersonalInformation {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  maritalStatus: string;
  aadhaarNumber: string;
  currentAddress: string;
  currentCity: string;
  currentState: string;
  currentPinCode: string;
  permanentAddress: string;
  permanentCity: string;
  permanentState: string;
  permanentPinCode: string;
  emergencyContactName: string;
  emergencyRelationship: string;
  emergencyPhoneNumber: string;
  emergencyAddress: string;
}

export interface ProfessionalInformation {
  employeeID: string;
  employeeType: string;
  employmentStatus: string;
  dateOfJoining: string;
  department: string;
}

export interface PayrollInformation {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  branchName: string;
  panNumber: string;
  uanNumber: string;
  esicNumber: string;
}

export interface EmployeeStoreState {
  personalInformation: PersonalInformation;
  professionalInformation: ProfessionalInformation;
  payrollInformation: PayrollInformation;

  setPersonalInformation: (data: Partial<PersonalInformation>) => void;
  setProfessionalInformation: (data: Partial<ProfessionalInformation>) => void;
  setPayrollInformation: (data: Partial<PayrollInformation>) => void;

  resetEmployeeData: () => void;
}
