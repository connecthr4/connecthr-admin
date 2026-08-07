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

import { useMemo } from 'react';
import { Text1 } from '../Typography';
import { useEmployeeStore } from '@/src/store/employeeStore';
import DynamicForm, { FieldConfig, FieldWidth } from '../DynamicForm/DynamicForm';
import { LocationsClient } from '@/src/lib/api/locationsClient';
import { personalInformationSchema, PersonalInformationFormValues } from './PersonalInformationForm.schema';
import type { DropdownOption } from '../Dropdown/Dropdown';

/**
 * Resolves the address dropdowns. Both lists come from the backend, and both are taken as
 * props so Storybook and tests can render the form without one — the defaults go through
 * `LocationsClient`, which caches each list for the lifetime of the page.
 */
export interface LocationOptionLoaders {
  loadStateOptions?: () => Promise<DropdownOption[]>;
  loadDistrictOptions?: (stateCode: string) => Promise<DropdownOption[]>;
}

/**
 * Define the props available for the PersonalInformationForm component.
 */
interface PersonalInformationFormProps extends LocationOptionLoaders {
  onSubmit: (data: PersonalInformationFormValues) => void;
  footer?: React.ReactNode;
}

const today = new Date();

/**
 * DatePicker can only navigate between startMonth and endMonth, which fall back to
 * 2024-2035, so a date of birth needs an explicit range to be reachable at all.
 */
const EARLIEST_DATE_OF_BIRTH = new Date(today.getFullYear() - 100, 0, 1);
const LATEST_DATE_OF_BIRTH = new Date(today.getFullYear(), today.getMonth(), today.getDate());

export const createPersonalInformationFormConfig = ({
  loadStateOptions = LocationsClient.getStateOptions,
  loadDistrictOptions = LocationsClient.getDistrictOptions,
}: LocationOptionLoaders = {}): FieldConfig<PersonalInformationFormValues>[] => [
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
    minDate: EARLIEST_DATE_OF_BIRTH,
    maxDate: LATEST_DATE_OF_BIRTH,
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
        value: 'Male',
      },
      {
        label: 'Female',
        value: 'Female',
      },
      {
        label: 'Other',
        value: 'Other',
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
    type: 'dropdown',
    width: FieldWidth.HALF,
    required: true,
    options: [
      {
        label: 'Single',
        value: 'Single',
      },
      {
        label: 'Married',
        value: 'Married',
      },
      {
        label: 'Divorced',
        value: 'Divorced',
      },
      {
        label: 'Widowed',
        value: 'Widowed',
      },
    ],
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
    name: 'currentState',
    label: 'Current State',
    placeholder: 'Select Current State',
    type: 'dropdown',
    width: FieldWidth.HALF,
    required: true,
    searchable: true,
    asyncOptions: { load: loadStateOptions },
  },
  {
    name: 'currentDistrictCode',
    label: 'Current District',
    placeholder: 'Select Current District',
    type: 'dropdown',
    width: FieldWidth.HALF,
    required: true,
    searchable: true,
    asyncOptions: { dependsOn: 'currentState', load: loadDistrictOptions },
  },
  {
    name: 'currentCity',
    label: 'Current City',
    placeholder: 'Enter Current City',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
  },
  {
    name: 'currentPinCode',
    label: 'Current PIN Code',
    placeholder: 'Enter Current PIN Code',
    type: 'input',
    width: FieldWidth.HALF,
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
        source: 'currentDistrictCode',
        target: 'permanentDistrictCode',
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
    name: 'permanentState',
    label: 'Permanent State',
    placeholder: 'Select Permanent State',
    type: 'dropdown',
    width: FieldWidth.HALF,
    required: true,
    searchable: true,
    disabledWhen: 'sameAsCurrentAddress',
    asyncOptions: { load: loadStateOptions },
  },
  {
    name: 'permanentDistrictCode',
    label: 'Permanent District',
    placeholder: 'Select Permanent District',
    type: 'dropdown',
    width: FieldWidth.HALF,
    required: true,
    searchable: true,
    disabledWhen: 'sameAsCurrentAddress',
    asyncOptions: { dependsOn: 'permanentState', load: loadDistrictOptions },
  },
  {
    name: 'permanentCity',
    label: 'Permanent City',
    placeholder: 'Enter Permanent City',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
    disabledWhen: 'sameAsCurrentAddress',
  },
  {
    name: 'permanentPinCode',
    label: 'Permanent PIN Code',
    placeholder: 'Enter Permanent PIN Code',
    type: 'input',
    width: FieldWidth.HALF,
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

export default function PersonalInformationForm({
  onSubmit,
  footer,
  loadStateOptions,
  loadDistrictOptions,
}: PersonalInformationFormProps) {
  const personalInformation = useEmployeeStore((state) => state.personalInformation);

  /*
    The config carries the option loaders, so it has to be rebuilt whenever they change —
    and kept stable otherwise, since DynamicForm reloads the address dropdowns whenever the
    field list changes identity.
  */
  const fields = useMemo(
    () => createPersonalInformationFormConfig({ loadStateOptions, loadDistrictOptions }),
    [loadStateOptions, loadDistrictOptions]
  );

  return (
    <DynamicForm
      fields={fields}
      schema={personalInformationSchema}
      defaultValues={personalInformation}
      onSubmit={onSubmit}
      footer={footer}
    />
  );
}
