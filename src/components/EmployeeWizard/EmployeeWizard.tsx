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
import { useRouter } from 'next/navigation';
import { FieldValues, useFormContext } from 'react-hook-form';
import styles from './EmployeeWizard.module.scss';
import AppHeader from '../AppHeader';
import Stepper from '../Stepper';
import PersonalInformationForm from '../PersonalInformationForm';
import Button from '../Button';
import ProfessionalInformationForm from '../ProfessionalInformationForm';
import PayrollInformationForm from '../PayrollInformationForm';
import DocumentUpload from '../DocumentUpload';
import Modal from '../Modal';
import { Caption, Text1, Text2 } from '../Typography';
import { useEmployeeStore } from '@/src/store/employeeStore';
import { NOTIFICATION_TYPES, ROUTES, STEPS, STRINGS } from '@/src/constants/strings';
import { createEmployee } from '@/src/lib/actions/employees';
import { useNotification } from '@/src/providers/NotificationProvider';
import { logger } from '@/src/lib/logger';
import type { CreateEmployeeRequest, CreatedEmployee } from '@/src/lib/types/employees';

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
    currentState: 'NJ',
    currentDistrictCode: '525',
    currentPinCode: '560001',
    sameAsCurrentAddress: false,

    permanentAddress: '2464 Royal Ln.',
    permanentCity: 'Mesa',
    permanentState: 'NJ',
    permanentDistrictCode: '525',
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

/**
 * Define the props available for the StepBackButton component.
 */
interface StepBackButtonProps {
  onBack: (values: FieldValues) => void;
}

/**
 * The wizard footer is rendered inside the active step's form, so this button can read
 * the values currently on screen and hand them back before the step is unmounted.
 */
function StepBackButton({ onBack }: StepBackButtonProps) {
  const { getValues } = useFormContext();

  return (
    <Button type="button" variant="secondary" onClick={() => onBack(getValues())}>
      Back
    </Button>
  );
}

/**
 * Define the props available for the EmployeeCreatedModal component.
 */
interface EmployeeCreatedModalProps {
  employee: CreatedEmployee;
  onClose: () => void;
}

/**
 * Confirmation shown once the create call succeeds, listing the record the backend assigned
 * so it can be checked before the user is handed back to the employees list.
 */
function EmployeeCreatedModal({ employee, onClose }: EmployeeCreatedModalProps) {
  const details = [
    { label: STRINGS.EMPLOYEE_ID, value: employee.employeeId },
    { label: STRINGS.DEPARTMENT, value: employee.department },
    { label: STRINGS.DESIGNATION, value: employee.designation },
    { label: STRINGS.EMPLOYEE_TYPE, value: employee.employeeType },
    { label: STRINGS.EMPLOYMENT_STATUS, value: employee.employmentStatus },
  ];

  return (
    /*
      Dismissing navigates away, so an overlay click is not enough to trigger it — the user
      has to reach for the close button or the action.
    */
    <Modal
      isOpen
      onClose={onClose}
      title={STRINGS.EMPLOYEE_CREATED_SUCCESSFULLY}
      closeOnOverlayClick={false}
      centered
      className={styles.createdModal}
    >
      <div className={styles.createdContainer}>
        <Text2 className={styles.createdName}>{employee.name}</Text2>

        <dl className={styles.createdDetails}>
          {details.map(({ label, value }) => (
            <div key={label} className={styles.createdDetail}>
              <Caption as="dt" className={styles.createdLabel}>
                {label}
              </Caption>

              <Text1 as="dd" className={styles.createdValue}>
                {value}
              </Text1>
            </div>
          ))}
        </dl>

        <div className={styles.createdActions}>
          <Button onClick={onClose}>{STRINGS.BACK_TO_ALL_EMPLOYEES}</Button>
        </div>
      </div>
    </Modal>
  );
}

export default function EmployeeWizard({ mode, employeeId }: EmployeeWizardProps) {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState<CreatedEmployee | null>(null);
  const setPersonalInformation = useEmployeeStore((state) => state.setPersonalInformation);
  const setProfessionalInformation = useEmployeeStore((state) => state.setProfessionalInformation);
  const setPayrollInformation = useEmployeeStore((state) => state.setPayrollInformation);
  const resetEmployeeData = useEmployeeStore((state) => state.resetEmployeeData);

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

  /**
   * Persist whatever is currently typed into a step so it can be restored when the user
   * navigates back to it. Unlike the submit handlers this runs without validation, so
   * partially filled steps survive the round trip too.
   */
  const persistStep = (step: number, values: FieldValues) => {
    switch (step) {
      case 0:
        return setPersonalInformation(values);

      case 1:
        return setProfessionalInformation(values);

      case 2:
        return setPayrollInformation(values);
    }
  };

  const handleBack = (values: FieldValues) => {
    if (isFirstStep) return;

    persistStep(currentStep, values);

    setCurrentStep((prev) => prev - 1);
  };

  const handlePersonalInformationSubmit = (data: FieldValues) => {
    setPersonalInformation(data);

    handleNext();
  };

  const handleProfessionalInformationSubmit = (data: FieldValues) => {
    setProfessionalInformation(data);

    handleNext();
  };

  const handlePayrollInformationSubmit = (data: FieldValues) => {
    setPayrollInformation(data);

    handleNext();
  };

  /**
   * Every completed step has already been written to the store, so the payload is read in one
   * go here. Only the professional section needs assembling: it carries the read-only Employee
   * ID for display, and the create endpoint assigns that itself and rejects one that is sent.
   */
  const handleDocumentUploadSubmit = async () => {
    setIsSubmitting(true);

    /*
      Read imperatively instead of subscribing with a selector: the wizard only needs these
      three slices at the moment of submit, and subscribing would re-render all four steps
      every time a step is saved.
    */
    const { personalInformation, professionalInformation, payrollInformation } = useEmployeeStore.getState();

    const request: CreateEmployeeRequest = {
      personalInformation,
      professionalInformation: {
        employeeType: professionalInformation.employeeType,
        employmentStatus: professionalInformation.employmentStatus,
        dateOfJoining: professionalInformation.dateOfJoining,
        department: professionalInformation.department,
      },
      payrollInformation,
    };

    try {
      const result = await createEmployee(request);

      if (!result.success) {
        showNotification(
          STRINGS.EMPLOYEE_CREATION_FAILED,
          result.message,
          NOTIFICATION_TYPES.ERROR,
          5000,
          'top-right',
          false
        );

        return;
      }

      /*
        The confirmation modal is the success message, so no notification is raised here —
        two of them for one action would just talk over each other.
      */
      setCreatedEmployee(result.data);
    } catch (error) {
      logger.error('Error occurred while creating employee:', error);

      showNotification(STRINGS.EMPLOYEE_CREATION_FAILED, '', NOTIFICATION_TYPES.ERROR, 5000, 'top-right', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Dismissing the confirmation hands the user back to the employees dashboard. The draft is
   * only cleared here, so the wizard still holds its data for as long as the confirmation is
   * on screen.
   */
  const handleCreatedModalClose = () => {
    resetEmployeeData();

    router.push(ROUTES.EMPLOYEES);
  };

  const renderFooter = () => (
    <div className={styles.footer}>
      <div>{!isFirstStep && <StepBackButton onBack={handleBack} />}</div>

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
        return (
          <DocumentUpload
            onSubmit={handleDocumentUploadSubmit}
            onBack={() => handleBack({})}
            isSubmitting={isSubmitting}
          />
        );

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

      {createdEmployee && <EmployeeCreatedModal employee={createdEmployee} onClose={handleCreatedModalClose} />}
    </div>
  );
}
