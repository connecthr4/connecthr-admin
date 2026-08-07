/**
 * A form component for capturing an employee&#x27;s professional, employment, and banking information.
 *
 * @example
 * ```tsx
 * import ProfessionalInformationForm from '@src/components/ProfessionalInformationForm'
 *
 * export default function ProfessionalInformationForm() {
 *   return <ProfessionalInformationForm label="Hello" />;
 * }
 * ```
 */

import { useEmployeeStore } from '@/src/store/employeeStore';
import DynamicForm from '../DynamicForm';
import { FieldConfig, FieldWidth } from '../DynamicForm/DynamicForm';
import { Text1 } from '../Typography';
import { professionalInformationSchema, ProfessionalInformationFormValues } from './ProfessionalInformationForm.schema';

/**
 * Define the props available for the ProfessionalInformationForm component.
 */
interface ProfessionalInformationFormProps {
  onSubmit: (data: ProfessionalInformationFormValues) => void;
  footer?: React.ReactNode;
}

/**
 * A joining date can be back-dated for employees onboarded after the fact, but never set in
 * the future. Both bounds are evaluated when this module is first imported, so a tab left
 * open across midnight keeps the previous day's ceiling until it is reloaded.
 */
const EARLIEST_JOINING_DATE = new Date(1990, 0, 1);
const LATEST_JOINING_DATE = new Date();

export const professionalInformationFormConfig: FieldConfig<ProfessionalInformationFormValues>[] = [
  {
    name: 'employmentDetailsLabel',
    label: 'Employment Details',
    type: 'label',
    labelComponent: Text1,
  },
  {
    name: 'employeeID',
    label: 'Employee ID',
    placeholder: 'Enter Employee ID',
    type: 'input',
    width: FieldWidth.HALF,
    disabled: true,
    required: false,
  },
  {
    name: 'employeeType',
    label: 'Employee Type',
    placeholder: 'Select Employee Type',
    type: 'dropdown',
    width: FieldWidth.HALF,
    required: true,
    // Values are the labels themselves: the create endpoint takes the display text
    // ("Full Time", "Part Time", ...) and rejects anything outside that set.
    options: [
      {
        label: 'Full Time',
        value: 'Full Time',
      },
      {
        label: 'Part Time',
        value: 'Part Time',
      },
      {
        label: 'Contract',
        value: 'Contract',
      },
      {
        label: 'Intern',
        value: 'Intern',
      },
    ],
  },
  {
    name: 'employmentStatus',
    label: 'Employment Status',
    placeholder: 'Select Employment Status',
    type: 'dropdown',
    width: FieldWidth.HALF,
    required: true,
    // A new employee always starts as Active, so the field is seeded from the store
    // and locked rather than left for the user to pick.
    disabled: true,
    options: [
      {
        label: 'Active',
        value: 'Active',
      },
      {
        label: 'Inactive',
        value: 'Inactive',
      },
      {
        label: 'On Notice',
        value: 'On Notice',
      },
      {
        label: 'Exited',
        value: 'Exited',
      },
    ],
  },
  {
    name: 'dateOfJoining',
    label: 'Date of Joining',
    placeholder: 'Select Date of Joining',
    type: 'datePicker',
    width: FieldWidth.HALF,
    required: true,
    minDate: EARLIEST_JOINING_DATE,
    maxDate: LATEST_JOINING_DATE,
  },
  {
    name: 'department',
    label: 'Department',
    placeholder: 'Select Department',
    type: 'dropdown',
    width: FieldWidth.HALF,
    required: true,
    options: [
      {
        label: 'Engineering',
        value: 'Engineering',
      },
      {
        label: 'Finance',
        value: 'Finance',
      },
      {
        label: 'Quality Assurance',
        value: 'Quality Assurance',
      },
    ],
  },
];

export default function ProfessionalInformationForm({ onSubmit, footer }: ProfessionalInformationFormProps) {
  const professionalInformation = useEmployeeStore((state) => state.professionalInformation);
  return (
    <DynamicForm
      fields={professionalInformationFormConfig}
      schema={professionalInformationSchema}
      defaultValues={professionalInformation}
      onSubmit={onSubmit}
      footer={footer}
    />
  );
}
