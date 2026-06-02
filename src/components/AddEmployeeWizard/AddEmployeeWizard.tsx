/**
 * A multi-step wizard component responsible for managing the employee creation workflow, including step navigation, form state management, validation, and employee data submission.
 *
 * @example
 * ```tsx
 * import AddEmployeeWizard from '@src/components/AddEmployeeWizard'
 *
 * export default function AddEmployeeWizard() {
 *   return <AddEmployeeWizard label="Hello" />;
 * }
 * ```
 */
'use client';

import { useState } from 'react';
import styles from './AddEmployeeWizard.module.scss';
import AppHeader from '../AppHeader';

/**
 * Define the props available for the AddEmployeeWizard component.
 */
interface AddEmployeeWizardProps {
  label?: string;
}

const STEPS = [
  {
    id: 'personal-information',
    label: 'Personal Information',
    // component: PersonalInformationStep,
  },
  {
    id: 'professional-information',
    label: 'Professional Information',
    // component: ProfessionalInformationStep,
  },
  {
    id: 'documents',
    label: 'Documents',
    // component: DocumentsStep,
  },
  {
    id: 'account-access',
    label: 'Account Access',
    // component: AccountAccessStep,
  },
] as const;

// const defaultValues: EmployeeFormData = {
//   // Personal Information
//   profilePhoto: null,
//   firstName: '',
//   lastName: '',
//   mobileNumber: '',
//   emailAddress: '',
//   dateOfBirth: '',
//   maritalStatus: '',
//   gender: '',
//   nationality: '',
//   address: '',
//   city: '',
//   state: '',
//   zipCode: '',

//   // Professional Information
//   employeeId: '',
//   employeeType: '',
//   department: '',
//   designation: '',
//   workingDays: '',
//   joiningDate: '',
//   officeLocation: '',
//   userName: '',

//   // Documents
//   appointmentLetter: null,
//   salarySlips: null,
//   relievingLetter: null,
//   experienceLetter: null,

//   // Account Access
//   officialEmail: '',
//   role: '',
// };

export default function AddEmployeeWizard({ label = 'label' }: AddEmployeeWizardProps) {
  // const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  // const ActiveStep = STEPS[currentStep].component;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;

  // const handleCancel = () => {
  //   router.push('/employees');
  // };

  // const handleBack = () => {
  //   if (isFirstStep) return;

  //   setCurrentStep((prev) => prev - 1);
  // };

  return (
    <div className={styles.container}>
      <AppHeader title="Add New Employee" subtitle="All Employee Information" />

      <div className={styles.content}></div>
    </div>
  );
}
