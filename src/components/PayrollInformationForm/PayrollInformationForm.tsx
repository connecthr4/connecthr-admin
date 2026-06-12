/**
 * A form component for capturing an employee&#x27;s payroll, banking, and statutory information.
 *
 * @example
 * ```tsx
 * import PayrollInformationForm from '@src/components/PayrollInformationForm'
 *
 * export default function PayrollInformationForm() {
 *   return <PayrollInformationForm label="Hello" />;
 * }
 * ```
 */

import DynamicForm from '../DynamicForm';
import { FieldConfig, FieldWidth } from '../DynamicForm/DynamicForm';
import { Text1 } from '../Typography';
import styles from './PayrollInformationForm.module.scss';
import { payrollInformationSchema } from './PayrollInformationForm.schema';

/**
 * Define the props available for the PayrollInformationForm component.
 */
interface PayrollInformationFormProps {
  onSubmit: (data: PayrollInformationFormData) => void;
  footer?: React.ReactNode;
}

export const professionalInformationFormConfig: FieldConfig[] = [
  {
    name: 'bankAccountDetailsLabel',
    label: 'Bank Account Details',
    type: 'label',
    labelComponent: Text1,
  },
  {
    name: 'accountHolderName',
    label: 'Account Holder Name',
    placeholder: 'Enter Account Holder Name',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
  },
  {
    name: 'bankName',
    label: 'Bank Name',
    placeholder: 'Enter Bank Name',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
  },
  {
    name: 'accountNumber',
    label: 'Account Number',
    placeholder: 'Enter Account Number',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
  },
  {
    name: 'confirmAccountNumber',
    label: 'Confirm Account Number',
    placeholder: 'Confirm Account Number',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
  },
  {
    name: 'ifscCode',
    label: 'IFSC Code',
    placeholder: 'Enter IFSC Code',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
  },
  {
    name: 'branchName',
    label: 'Branch Name',
    placeholder: 'Enter Branch Name',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
  },
  {
    name: 'statutoryDetails',
    label: 'Statutory Details',
    type: 'label',
    labelComponent: Text1,
  },
  {
    name: 'panNumber',
    label: 'PAN Number',
    placeholder: 'Enter PAN Number',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
  },
  {
    name: 'uanNumber',
    label: 'UAN Number',
    placeholder: 'Enter UAN Number',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
  },
  {
    name: 'esicNumber',
    label: 'ESIC Number',
    placeholder: 'Enter ESIC Number',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
  },
];

export default function PayrollInformationForm({ onSubmit, footer }: PayrollInformationFormProps) {
  return (
    <DynamicForm
      fields={professionalInformationFormConfig}
      schema={payrollInformationSchema}
      onSubmit={onSubmit}
      footer={footer}
    />
  );
}
