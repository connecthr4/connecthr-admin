import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import ProfessionalInformationForm from './ProfessionalInformationForm';
import Button from '../Button';
import { useEmployeeStore } from '@/src/store/employeeStore';
import type { ProfessionalInformationDraft } from '@/src/store/employeeStore/types';

const filledProfessionalInformation: ProfessionalInformationDraft = {
  employeeID: 'EMP001',
  employeeType: 'Full Time',
  employmentStatus: 'Active',
  dateOfJoining: '2024-03-18',
  department: 'Engineering',
};

const meta = {
  title: 'components/ProfessionalInformationForm',
  component: ProfessionalInformationForm,
  parameters: {
    /*
      The form is a 12-column grid of half-width fields, so `centered` collapses it to the
      width of its content and the fields stop pairing up.
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
} satisfies Meta<typeof ProfessionalInformationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The blank form, as it appears on the second step of the employee wizard. Employment
 * Status already reads Active: the store seeds it, since that is the only status a new
 * employee can be created with.
 */
export const Default: Story = {};

/**
 * Restored from the store, the way the step looks when the user navigates back to it.
 */
export const Prefilled: Story = {
  beforeEach: () => {
    useEmployeeStore.setState({ professionalInformation: filledProfessionalInformation });
  },
};

/**
 * Employee ID is assigned by the backend and Employment Status is fixed for a new joiner,
 * so both are shown for context but cannot be edited.
 */
export const LockedFields: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByPlaceholderText('Enter Employee ID')).toBeDisabled();

    // A disabled Dropdown still renders its trigger, labelled by the seeded selection.
    await expect(canvas.getByRole('button', { name: 'Active' })).toBeDisabled();
  },
};

/**
 * Submitting an empty form surfaces the Zod messages against every required field. Employee
 * ID is optional and Employment Status arrives pre-filled, so neither is reported.
 */
export const WithValidationErrors: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));

    await expect(await canvas.findByText('Employee Type is required')).toBeInTheDocument();
    await expect(await canvas.findByText('Date of Joining is required')).toBeInTheDocument();
    await expect(await canvas.findByText('Department is required')).toBeInTheDocument();

    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

/**
 * Picking the two open dropdowns completes the step and hands the values to the wizard. The
 * joining date is restored from the store rather than picked here, so the run does not
 * depend on which month the calendar happens to open on.
 */
export const CompletingTheStep: Story = {
  beforeEach: () => {
    useEmployeeStore.setState({
      professionalInformation: { ...filledProfessionalInformation, employeeType: '', department: '' },
    });
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Select Employee Type' }));
    await userEvent.click(await canvas.findByRole('button', { name: 'Full Time' }));

    await userEvent.click(canvas.getByRole('button', { name: 'Select Department' }));
    await userEvent.click(await canvas.findByRole('button', { name: 'Engineering' }));

    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));

    await waitFor(() => expect(args.onSubmit).toHaveBeenCalled());

    await expect(args.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        employeeType: 'Full Time',
        department: 'Engineering',
        employmentStatus: 'Active',
        dateOfJoining: '2024-03-18',
      }),
      expect.anything()
    );
  },
};
