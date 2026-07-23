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
import { FieldWidth } from '../DynamicForm/DynamicForm';
import { Text1 } from '../Typography';
import styles from './ProfessionalInformationForm.module.scss';
import { professionalInformationSchema } from './ProfessionalInformationForm.schema';

/**
 * Define the props available for the ProfessionalInformationForm component.
 */
interface ProfessionalInformationFormProps {
  onSubmit: (data: ProfessionalInformationFormValues) => void;
  footer?: React.ReactNode;
}

export const professionalInformationFormConfig: FieldConfig[] = [
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
    options: [
      {
        label: 'Full-Time',
        value: 'full_time',
      },
      {
        label: 'Contract',
        value: 'contract',
      },
    ],
  },
  {
    name: 'employmentStatus',
    label: 'Employment Status',
    placeholder: 'Select Employment Status',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
    options: [
      {
        label: 'Active',
        value: 'active',
      },
      {
        label: 'In Active',
        value: 'inActive',
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
  },
  {
    name: 'department',
    label: 'Department',
    placeholder: 'Select Department',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
    options: [
      {
        label: 'Engineering',
        value: 'engineering',
      },
      {
        label: 'Finance',
        value: 'finance',
      },
      {
        label: 'Quality Assurance',
        value: 'quality_assurance',
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
