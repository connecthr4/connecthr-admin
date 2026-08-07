import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import PayrollInformationForm from './PayrollInformationForm';
import Button from '../Button';
import { useEmployeeStore } from '@/src/store/employeeStore';
import type { PayrollInformation } from '@/src/store/employeeStore/types';

const filledPayrollInformation: PayrollInformation = {
  accountHolderName: 'Brooklyn Simmons',
  bankName: 'HDFC Bank',
  accountNumber: '1234567890123456',
  confirmAccountNumber: '1234567890123456',
  ifscCode: 'HDFC0001234',
  branchName: 'Koramangala Branch',
  panNumber: 'ABCDE1234F',
  uanNumber: '100200300400',
  esicNumber: '1234567890',
};

const meta = {
  title: 'components/PayrollInformationForm',
  component: PayrollInformationForm,
  parameters: {
    /*
      The form is a 12-column grid of full-width fields, so `centered` collapses it to the
      width of its content and the half-width fields stop pairing up.
    */
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onSubmit: { action: 'submitted' },
    footer: { control: false },
  },
  args: {
    onSubmit: fn(),
    /*
      The component renders no actions of its own — the wizard passes them in. Without a
      submit button here there is no way to reach validation or `onSubmit` from the story.
    */
    footer: <Button type="submit">Next</Button>,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '56rem' }}>
        <Story />
      </div>
    ),
  ],
  /*
    `defaultValues` are read from the employee store, which is a module-level singleton and
    therefore shared by every story in the session. Reset around each one so stories cannot
    seed each other.
  */
  beforeEach: () => {
    useEmployeeStore.getState().resetEmployeeData();

    return () => useEmployeeStore.getState().resetEmployeeData();
  },
} satisfies Meta<typeof PayrollInformationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The blank form, as it appears on the third step of the employee wizard.
 */
export const Default: Story = {};

/**
 * Restored from the store, the way the step looks when the user navigates back to it.
 */
export const Prefilled: Story = {
  beforeEach: () => {
    useEmployeeStore.setState({ payrollInformation: filledPayrollInformation });
  },
};

/**
 * Submitting an empty form surfaces the Zod messages against every required field.
 */
export const WithValidationErrors: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));

    await expect(await canvas.findByText('Account Holder Name is required')).toBeInTheDocument();
    await expect(canvas.getByText('Bank Name is required')).toBeInTheDocument();

    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

/**
 * Bank and statutory identifiers are checked against their formats, not just for being
 * filled in — a plausible-looking IFSC or PAN is still rejected if it is malformed.
 */
export const WithInvalidFormats: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByPlaceholderText('Enter Account Number'), '12345');
    await userEvent.type(canvas.getByPlaceholderText('Enter IFSC Code'), 'HDFC123');
    await userEvent.type(canvas.getByPlaceholderText('Enter PAN Number'), 'ABC1234');

    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));

    await expect(await canvas.findByText('Enter a valid Account Number')).toBeInTheDocument();
    await expect(canvas.getByText('Enter a valid IFSC Code')).toBeInTheDocument();
    await expect(canvas.getByText('Enter a valid PAN Number')).toBeInTheDocument();

    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

/**
 * The confirmation field is checked against the account number itself, so a typo in either
 * one is reported on the confirmation.
 */
export const WithMismatchedAccountNumbers: Story = {
  beforeEach: () => {
    useEmployeeStore.setState({ payrollInformation: filledPayrollInformation });
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const confirmAccountNumber = canvas.getByPlaceholderText('Confirm Account Number');

    await userEvent.clear(confirmAccountNumber);
    await userEvent.type(confirmAccountNumber, '9999999999999999');

    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));

    await expect(await canvas.findByText('Account numbers do not match')).toBeInTheDocument();

    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

/**
 * A fully valid step hands its values to the wizard, which is what moves it on to the
 * document upload.
 */
export const SubmitsValidValues: Story = {
  beforeEach: () => {
    useEmployeeStore.setState({ payrollInformation: filledPayrollInformation });
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));

    await waitFor(() => expect(args.onSubmit).toHaveBeenCalledTimes(1));

    await expect(canvas.queryByText('Account numbers do not match')).not.toBeInTheDocument();
  },
};
