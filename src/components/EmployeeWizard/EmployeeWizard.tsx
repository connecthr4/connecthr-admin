/**
 * A multi-step wizard component responsible for managing the employee creation workflow, including step navigation, form state management, validation, and employee data submission.
 *
 * @example
 * ```tsx
 * import EmployeeWizard from '@src/components/EmployeeWizard'
 *
 * export default function EmployeeWizard() {
 *   return <EmployeeWizard label="Hello" />;
 * }
 * ```
 */
'use client';

import { useEffect, useState } from 'react';
import styles from './EmployeeWizard.module.scss';
import AppHeader from '../AppHeader';
import Stepper from '../Stepper';
import PersonalInformationForm from '../PersonalInformationForm';
import Button from '../Button';
import ProfessionalInformationForm from '../ProfessionalInformationForm';
import PayrollInformationForm from '../PayrollInformationForm';
import { useEmployeeStore } from '@/src/store/employeeStore';
import { STEPS } from '@/src/constants/strings';

/**
 * Define the props available for the EmployeeWizard component.
 */
interface EmployeeWizardProps {
  mode: 'create' | 'edit';
  employeeId?: string;
}

// mocks/employee.ts

export const mockEmployee = {
  personalInformation: {
    firstName: 'Brooklyn',
    lastName: 'Simmons',
    mobileNumber: '9876543210',
    email: 'brooklyn.s@example.com',
    dateOfBirth: '1992-07-10',
    gender: 'Female',
    nationality: 'American',
    maritalStatus: 'Single',
    aadhaarNumber: '123456789012',

    currentAddress: '2464 Royal Ln.',
    currentCity: 'Mesa',
    currentState: 'New Jersey',
    currentPinCode: '560001',
    sameAsCurrentAddress: false,

    permanentAddress: '2464 Royal Ln.',
    permanentCity: 'Mesa',
    permanentState: 'New Jersey',
    permanentPinCode: '560001',

    emergencyContactName: 'Robert Simmons',
    emergencyRelationship: 'Father',
    emergencyPhoneNumber: '9123456789',
    emergencyAddress: '123 Main Street, Mesa, New Jersey',
  },

  professionalInformation: {
    employeeID: 'EMP001',
    employeeType: 'Full Time',
    employmentStatus: 'Active',
    dateOfJoining: '1992-07-10',
    department: 'Engineering',
  },

  payrollInformation: {
    accountHolderName: 'Brooklyn Simmons',
    bankName: 'HDFC Bank',
    accountNumber: '1234567890123456',
    confirmAccountNumber: '1234567890123456',
    ifscCode: 'HDFC0001234',
    branchName: 'Koramangala Branch',
    panNumber: 'ABCDE1234F',
    uanNumber: '100200300400',
    esicNumber: '1234567890',
  },
};

export default function EmployeeWizard({ mode, employeeId }: EmployeeWizardProps) {
  // const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const setPersonalInformation = useEmployeeStore((state) => state.setPersonalInformation);
  const setProfessionalInformation = useEmployeeStore((state) => state.setProfessionalInformation);
  const setPayrollInformation = useEmployeeStore((state) => state.setPayrollInformation);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;

  useEffect(() => {
    if (mode !== 'edit') return;

    setPersonalInformation(mockEmployee.personalInformation);

    setProfessionalInformation(mockEmployee.professionalInformation);

    setPayrollInformation(mockEmployee.payrollInformation);
  }, [mode, setPersonalInformation, setProfessionalInformation, setPayrollInformation]);

  const handleNext = () => {
    if (isLastStep) return;

    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (isFirstStep) return;

    setCurrentStep((prev) => prev - 1);
  };

  const handlePersonalInformationSubmit = (data: any) => {
    setPersonalInformation(data);

    handleNext();
  };

  const handleProfessionalInformationSubmit = (data: any) => {
    setProfessionalInformation(data);

    handleNext();
  };

  const handlePayrollInformationSubmit = (data: any) => {
    setPayrollInformation(data);

    handleNext();
  };

  const renderFooter = () => (
    <div className={styles.footer}>
      <div>
        {!isFirstStep && (
          <Button type="button" variant="secondary" onClick={handleBack}>
            Back
          </Button>
        )}
      </div>

      <Button type="submit">{isLastStep ? 'Create Employee' : 'Next'}</Button>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <PersonalInformationForm onSubmit={handlePersonalInformationSubmit} footer={renderFooter()} />;

      case 1:
        return <ProfessionalInformationForm onSubmit={handleProfessionalInformationSubmit} footer={renderFooter()} />;

      case 2:
        return <PayrollInformationForm onSubmit={handlePayrollInformationSubmit} footer={renderFooter()} />;

      case 3:
        return <div>Account Access Form</div>;

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <AppHeader
        title="Add New Employee"
        breadcrumbs={[{ label: 'All Employees', href: '/employees' }, { label: 'Add New Employee' }]}
      />

      <div className={styles.content}>
        <Stepper currentStep={currentStep} steps={STEPS} />
        <div className={styles.formContainer}>{renderCurrentStep()}</div>
      </div>
    </div>
  );
}
