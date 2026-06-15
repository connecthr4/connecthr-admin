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
import { User, BriefcaseBusiness, FileText, Wallet } from 'lucide-react';
import Stepper from '../Stepper';
import PersonalInformationForm from '../PersonalInformationForm';
import Button from '../Button';
import ProfessionalInformationForm from '../ProfessionalInformationForm';
import PayrollInformationForm from '../PayrollInformationForm';
import { useEmployeeStore } from '@/src/store/employeeStore';

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
    icon: User,
  },
  {
    id: 'professional-information',
    label: 'Professional Information',
    icon: BriefcaseBusiness,
  },
  {
    id: 'payroll-information',
    label: 'Payroll Information',
    icon: Wallet,
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
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
  const setPersonalInformation = useEmployeeStore((state) => state.setPersonalInformation);
  const setProfessionalInformation = useEmployeeStore((state) => state.setProfessionalInformation);
  const setPayrollInformation = useEmployeeStore((state) => state.setPayrollInformation);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;

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
