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

import { useEffect, useMemo, useState } from 'react';
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
import {
  fromEmployeeDetail,
  hasEmployeeUpdates,
  toUpdateEmployeeRequest,
  useEmployeeStore,
  type EmployeeDraft,
} from '@/src/store/employeeStore';
import { NOTIFICATION_TYPES, ROUTES, STEPS, STRINGS } from '@/src/constants/strings';
import { createEmployee, updateEmployee } from '@/src/lib/actions/employees';
import { useNotification } from '@/src/providers/NotificationProvider';
import { logger } from '@/src/lib/logger';
import type { CreateEmployeeRequest, EmployeeDetail, EmployeeSummary } from '@/src/lib/types/employees';

/**
 * Define the props available for the EmployeeWizard component.
 */
interface EmployeeWizardProps {
  mode: 'create' | 'edit';

  /**
   * The record to edit, fetched by the route. Every step reads its values from the store,
   * so this is seeded into it rather than threaded through the steps as props.
   */
  employee?: EmployeeDetail;
}

/**
 * Seeds the draft every step reads from with the record being edited, and drops it again
 * when the wizard is left.
 *
 * @remarks
 * Deliberately an effect rather than a render-time write: the store is a module singleton,
 * and on the server that module is shared by every request the process handles — seeding it
 * while rendering would let one user's record surface in another's render. The steps
 * therefore mount against the empty draft and are populated as soon as this runs;
 * `DynamicForm` reseeds its fields whenever `defaultValues` changes, so no step needs to
 * know that the values arrived a beat late.
 *
 * Read imperatively through `getState()` so the wizard never subscribes to the store: it
 * renders all four steps, and a subscription would re-render every one of them each time a
 * step is saved.
 */
function useEmployeeDraft(draft: EmployeeDraft | null) {
  useEffect(() => {
    const { setEmployeeData, resetEmployeeData } = useEmployeeStore.getState();

    if (draft) {
      setEmployeeData(draft);
    }

    // Leaving the wizard discards the draft, so "Add New Employee" never opens on the
    // employee that was edited last.
    return resetEmployeeData;
  }, [draft]);
}

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
 * Define the props available for the EmployeeSavedModal component.
 */
interface EmployeeSavedModalProps {
  /**
   * Heading for the confirmation — always the `message` from the create/update response, so
   * the wording the user reads is the backend's own.
   */
  title: string;

  employee: EmployeeSummary;

  onClose: () => void;
}

/**
 * Confirmation shown once the create or update call succeeds, listing the saved record so it
 * can be checked before the user is handed on.
 */
function EmployeeSavedModal({ title, employee, onClose }: EmployeeSavedModalProps) {
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
    <Modal isOpen onClose={onClose} title={title} closeOnOverlayClick={false} centered className={styles.createdModal}>
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

/**
 * What the final step's submit came back with. `unchanged` only ever comes out of an edit:
 * the user walked to the last step without touching a field, so there is nothing to PATCH.
 */
type SubmitOutcome =
  | { status: 'saved'; message: string; employee: EmployeeSummary }
  | { status: 'unchanged' }
  | { status: 'failed'; message: string };

/**
 * The update endpoint echoes the full record back, so the fields the confirmation lists are
 * picked out of its sections here.
 */
function toEmployeeSummary(employee: EmployeeDetail): EmployeeSummary {
  const { department, designation, employeeType, employmentStatus } = employee.professionalInformation;

  return {
    name: employee.name,
    employeeId: employee.employeeId,
    department,
    designation,
    employeeType,
    employmentStatus,
  };
}

/**
 * Reads the draft imperatively rather than through a selector: the wizard only needs these
 * three slices at the moment of submit, and subscribing would re-render all four steps every
 * time a step is saved.
 */
function readDraft(): EmployeeDraft {
  const { personalInformation, professionalInformation, payrollInformation } = useEmployeeStore.getState();

  return { personalInformation, professionalInformation, payrollInformation };
}

/**
 * Every completed step has already been written to the store, so the payload is read in one
 * go here. Only the professional section needs assembling: it carries the read-only Employee
 * ID for display, and the create endpoint assigns that itself and rejects one that is sent.
 */
async function submitCreate(): Promise<SubmitOutcome> {
  const { personalInformation, professionalInformation, payrollInformation } = readDraft();

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

  const result = await createEmployee(request);

  if (!result.success) {
    return { status: 'failed', message: result.message };
  }

  return { status: 'saved', message: result.message, employee: result.data };
}

/**
 * `/employees/:id` is a PATCH, so the draft is diffed against the record it was seeded from
 * and only what changed is sent — an untouched section never leaves the browser.
 */
async function submitUpdate(employeeId: string, original: EmployeeDraft): Promise<SubmitOutcome> {
  const request = toUpdateEmployeeRequest(original, readDraft());

  if (!hasEmployeeUpdates(request)) {
    return { status: 'unchanged' };
  }

  const result = await updateEmployee(employeeId, request);

  if (!result.success) {
    return { status: 'failed', message: result.message };
  }

  return { status: 'saved', message: result.message, employee: toEmployeeSummary(result.data) };
}

export default function EmployeeWizard({ mode, employee }: EmployeeWizardProps) {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedEmployee, setSavedEmployee] = useState<{ message: string; employee: EmployeeSummary } | null>(null);
  const setPersonalInformation = useEmployeeStore((state) => state.setPersonalInformation);
  const setProfessionalInformation = useEmployeeStore((state) => state.setProfessionalInformation);
  const setPayrollInformation = useEmployeeStore((state) => state.setPayrollInformation);
  const resetEmployeeData = useEmployeeStore((state) => state.resetEmployeeData);

  /*
    Mapped once and kept: it both seeds the wizard and, on submit, is the "before" the draft is
    diffed against to build the PATCH body.
  */
  const originalDraft = useMemo(() => (employee ? fromEmployeeDetail(employee) : null), [employee]);

  useEmployeeDraft(originalDraft);

  const isEditing = mode === 'edit';
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;

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

  const failureTitle = isEditing ? STRINGS.EMPLOYEE_UPDATE_FAILED : STRINGS.EMPLOYEE_CREATION_FAILED;

  /**
   * The last step saves the whole draft: as a new employee, or — when an existing one is being
   * edited — as a PATCH carrying just the fields that changed.
   */
  const handleDocumentUploadSubmit = async () => {
    setIsSubmitting(true);

    try {
      const outcome =
        isEditing && employee && originalDraft ? await submitUpdate(employee.id, originalDraft) : await submitCreate();

      switch (outcome.status) {
        case 'saved':
          /*
            The confirmation modal is the success message, so no notification is raised here —
            two of them for one action would just talk over each other.
          */
          return setSavedEmployee({ message: outcome.message, employee: outcome.employee });

        case 'unchanged':
          return showNotification(
            STRINGS.NO_CHANGES_TO_UPDATE,
            STRINGS.NOTHING_WAS_CHANGED,
            NOTIFICATION_TYPES.INFO,
            5000,
            'top-right',
            false
          );

        case 'failed':
          return showNotification(failureTitle, outcome.message, NOTIFICATION_TYPES.ERROR, 5000, 'top-right', false);
      }
    } catch (error) {
      logger.error(`Error occurred while ${isEditing ? 'updating' : 'creating'} employee:`, error);

      showNotification(failureTitle, '', NOTIFICATION_TYPES.ERROR, 5000, 'top-right', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Dismissing the confirmation hands the user back to the employees dashboard, whether the
   * record was just created or updated. The draft is only cleared here, so the wizard still
   * holds its data for as long as the confirmation is on screen.
   */
  const handleSavedModalClose = () => {
    resetEmployeeData();

    router.push(ROUTES.EMPLOYEES);
  };

  const submitLabel = isEditing ? STRINGS.UPDATE_EMPLOYEE : STRINGS.CREATE_EMPLOYEE;

  const renderFooter = () => (
    <div className={styles.footer}>
      <div>{!isFirstStep && <StepBackButton onBack={handleBack} />}</div>

      <Button type="submit">{isLastStep ? submitLabel : 'Next'}</Button>
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
            submitLabel={submitLabel}
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
        title={isEditing ? STRINGS.EDIT_EMPLOYEE : STRINGS.ADD_NEW_EMPLOYEE}
        breadcrumbs={[
          { label: STRINGS.ALL_EMPLOYEES, href: ROUTES.EMPLOYEES },
          // The employee's own name links back to the record being edited; there is no such
          // record to point at yet while one is being created.
          ...(employee ? [{ label: employee.name, href: `${ROUTES.EMPLOYEES}/${employee.id}` }] : []),
          { label: isEditing ? STRINGS.EDIT_EMPLOYEE : STRINGS.ADD_NEW_EMPLOYEE },
        ]}
      />

      <div className={styles.content}>
        <Stepper currentStep={currentStep} steps={STEPS} />
        <div className={styles.formContainer}>{renderCurrentStep()}</div>
      </div>

      {savedEmployee && (
        /*
          The heading is the backend's own message ("Employee updated successfully."), so
          whatever it reports is what the user reads.
        */
        <EmployeeSavedModal
          title={savedEmployee.message}
          employee={savedEmployee.employee}
          onClose={handleSavedModalClose}
        />
      )}
    </div>
  );
}
