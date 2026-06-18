/**
 * A form component that captures and validates an employee&#x27;s personal information as part of the employee onboarding workflow.
 *
 * @example
 * ```tsx
 * import PersonalInformationForm from '@src/components/PersonalInformationForm'
 *
 * export default function PersonalInformationForm() {
 *   return <PersonalInformationForm label="Hello" />;
 * }
 * ```
 */

import DynamicForm, { FieldConfig, FieldWidth } from '../DynamicForm/DynamicForm';
import { Text1 } from '../Typography';
import { personalInformationSchema } from './PersonalInformationForm.schema';
import styles from './PersonalInformationForm.module.scss';
import { useEmployeeStore } from '@/src/store/employeeStore';

/**
 * Define the props available for the PersonalInformationForm component.
 */
interface PersonalInformationFormProps {
  onSubmit: (data: PersonalInformationFormData) => void;
  footer?: React.ReactNode;
}

export const personalInformationFormConfig: FieldConfig[] = [
  {
    name: 'personalDetailsLabel',
    label: 'Personal Details',
    type: 'label',
    labelComponent: Text1,
  },
  {
    name: 'firstName',
    label: 'First Name',
    placeholder: 'Enter First Name',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
  },
  {
    name: 'lastName',
    label: 'Last Name',
    placeholder: 'Enter Last Name',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
  },
  {
    name: 'mobileNumber',
    label: 'Mobile Number',
    placeholder: 'Enter Mobile Number',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
  },
  {
    name: 'email',
    label: 'Email Address',
    placeholder: 'Enter Email Address',
    type: 'input',
    width: FieldWidth.HALF,
    required: false,
  },
  {
    name: 'dateOfBirth',
    label: 'Date Of Birth',
    type: 'datePicker',
    width: FieldWidth.HALF,
    required: true,
  },
  {
    name: 'gender',
    label: 'Gender',
    placeholder: 'Select Gender',
    type: 'dropdown',
    width: FieldWidth.HALF,
    required: true,
    options: [
      {
        label: 'Male',
        value: 'male',
      },
      {
        label: 'Female',
        value: 'female',
      },
    ],
  },
  {
    name: 'nationality',
    label: 'Nationality',
    placeholder: 'Enter Nationality',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
  },
  {
    name: 'maritalStatus',
    label: 'Marital Status',
    placeholder: 'Select Marital Status',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
  },
  {
    name: 'aadhaarNumber',
    label: 'Aadhaar Number',
    placeholder: 'Enter Aadhaar Number',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
  },
  {
    name: 'addressInfoLabel',
    label: 'Address Information',
    type: 'label',
    labelComponent: Text1,
  },
  {
    name: 'currentAddress',
    label: 'Current Address',
    placeholder: 'Enter Current Address',
    type: 'input',
    width: FieldWidth.FULL,
    required: true,
  },
  {
    name: 'currentCity',
    label: 'Current City',
    placeholder: 'Enter Current City',
    type: 'input',
    width: FieldWidth.THIRD,
    required: true,
  },
  {
    name: 'currentState',
    label: 'Current State',
    placeholder: 'Enter Current State',
    type: 'input',
    width: FieldWidth.THIRD,
    required: true,
  },
  {
    name: 'currentPinCode',
    label: 'Current PIN Code',
    placeholder: 'Enter Current PIN Code',
    type: 'input',
    width: FieldWidth.THIRD,
    required: true,
  },
  {
    name: 'sameAsCurrentAddress',
    label: 'Permanent Address is same as Current Address',
    type: 'checkbox',
    width: FieldWidth.FULL,
    syncFields: [
      {
        source: 'currentAddress',
        target: 'permanentAddress',
      },
      {
        source: 'currentCity',
        target: 'permanentCity',
      },
      {
        source: 'currentState',
        target: 'permanentState',
      },
      {
        source: 'currentPinCode',
        target: 'permanentPinCode',
      },
    ],
  },
  {
    name: 'permanentAddress',
    label: 'Permanent Address',
    placeholder: 'Enter Permanent Address',
    type: 'input',
    width: FieldWidth.FULL,
    required: true,
    disabledWhen: 'sameAsCurrentAddress',
  },
  {
    name: 'permanentCity',
    label: 'Permanent City',
    placeholder: 'Enter Permanent City',
    type: 'input',
    width: FieldWidth.THIRD,
    required: true,
    disabledWhen: 'sameAsCurrentAddress',
  },
  {
    name: 'permanentState',
    label: 'Permanent State',
    placeholder: 'Enter Permanent State',
    type: 'input',
    width: FieldWidth.THIRD,
    required: true,
    disabledWhen: 'sameAsCurrentAddress',
  },
  {
    name: 'permanentPinCode',
    label: 'Permanent PIN Code',
    placeholder: 'Enter Permanent PIN Code',
    type: 'input',
    width: FieldWidth.THIRD,
    required: true,
    disabledWhen: 'sameAsCurrentAddress',
  },
  {
    name: 'emergencyContactLabel',
    label: 'Emergency Contact Details',
    type: 'label',
    labelComponent: Text1,
  },
  {
    name: 'emergencyContactName',
    label: 'Contact Name',
    placeholder: 'Enter Contact Name',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
  },
  {
    name: 'emergencyRelationship',
    label: 'Relationship',
    placeholder: 'Enter Relationship',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
  },
  {
    name: 'emergencyPhoneNumber',
    label: 'Phone Number',
    placeholder: 'Enter Phone Number',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
  },
  {
    name: 'emergencyAddress',
    label: 'Address',
    placeholder: 'Enter Address',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
  },
];

export default function PersonalInformationForm({ onSubmit, footer }: PersonalInformationFormProps) {
  const personalInformation = useEmployeeStore((state) => state.personalInformation);
  return (
    <DynamicForm
      fields={personalInformationFormConfig}
      schema={personalInformationSchema}
      defaultValues={personalInformation}
      onSubmit={onSubmit}
      footer={footer}
    />
  );
}
