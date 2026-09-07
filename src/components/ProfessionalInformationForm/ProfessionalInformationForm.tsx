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

import { useMemo } from 'react';
import { useEmployeeStore } from '@/src/store/employeeStore';
import DynamicForm from '../DynamicForm';
import { FieldConfig, FieldWidth } from '../DynamicForm/DynamicForm';
import { Text1 } from '../Typography';
import { ShiftsClient } from '@/src/lib/api/shiftsClient';
import { EmployeeOptionsClient } from '@/src/lib/api/optionsClient';
import { professionalInformationSchema, ProfessionalInformationFormValues } from './ProfessionalInformationForm.schema';
import type { DropdownOption } from '../Dropdown/Dropdown';

/**
 * Resolves the dropdowns the backend owns. Both lists are taken as props so Storybook and
 * tests can render the form without one — the defaults go through `ShiftsClient` and
 * `EmployeeOptionsClient`, which cache each list for the lifetime of the page.
 */
export interface ProfessionalOptionLoaders {
  loadShiftOptions?: () => Promise<DropdownOption[]>;
  loadDepartmentOptions?: () => Promise<DropdownOption[]>;
}

/**
 * Define the props available for the ProfessionalInformationForm component.
 */
interface ProfessionalInformationFormProps extends ProfessionalOptionLoaders {
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

export const createProfessionalInformationFormConfig = ({
  loadShiftOptions = ShiftsClient.getShiftOptions,
  loadDepartmentOptions = EmployeeOptionsClient.getDepartmentOptions,
}: ProfessionalOptionLoaders = {}): FieldConfig<ProfessionalInformationFormValues>[] => [
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
    /*
      The departments are the ones the backend defines, so they are read from
      `/options/employee/department` rather than declared here: the create endpoint takes the
      display text and rejects anything outside that set. A department restored from a saved
      draft — or from the record being edited — that is no longer offered is dropped by
      DynamicForm, so the step cannot be completed with one that has since been retired.
    */
    asyncOptions: { load: loadDepartmentOptions },
  },
  {
    name: 'shiftCode',
    label: 'Shift',
    placeholder: 'Select Shift',
    type: 'dropdown',
    width: FieldWidth.HALF,
    required: true,
    searchable: true,
    /*
      The options are the shifts the backend defines, so they are read from `/shifts` rather
      than declared here: the create endpoint takes a shift `code` and rejects one it does
      not know. A code restored from a saved draft — or from the record being edited — that
      is no longer in the list is dropped by DynamicForm, so the step cannot be completed
      with a shift that has since been retired.
    */
    asyncOptions: { load: loadShiftOptions },
  },
];

export default function ProfessionalInformationForm({
  onSubmit,
  footer,
  loadShiftOptions,
  loadDepartmentOptions,
}: ProfessionalInformationFormProps) {
  const professionalInformation = useEmployeeStore((state) => state.professionalInformation);

  /*
    The config carries the option loaders, so it has to be rebuilt whenever they change — and
    kept stable otherwise, since DynamicForm reloads the fetched dropdowns whenever the field
    list changes identity.
  */
  const fields = useMemo(
    () => createProfessionalInformationFormConfig({ loadShiftOptions, loadDepartmentOptions }),
    [loadShiftOptions, loadDepartmentOptions]
  );

  return (
    <DynamicForm
      fields={fields}
      schema={professionalInformationSchema}
      defaultValues={professionalInformation}
      onSubmit={onSubmit}
      footer={footer}
    />
  );
}
