import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import PersonalInformationForm from './PersonalInformationForm';
import Button from '../Button';
import { useEmployeeStore } from '@/src/store/employeeStore';
import type { PersonalInformation } from '@/src/store/employeeStore/types';
import type { DropdownOption } from '../Dropdown/Dropdown';

/**
 * Storybook has no backend behind the `locations` Server Functions, so the address
 * dropdowns are served from a fixture instead — enough states and districts to exercise the
 * dependent lookup without pulling in the real lists.
 */
const stateOptions: DropdownOption[] = [
  { label: 'Karnataka', value: 'KA' },
  { label: 'Tamil Nadu', value: 'TN' },
];

const districtOptionsByState: Record<string, DropdownOption[]> = {
  KA: [
    { label: 'Bengaluru Urban', value: '525' },
    { label: 'Mysuru', value: '532' },
  ],
  TN: [
    { label: 'Chennai', value: '568' },
    { label: 'Coimbatore', value: '571' },
  ],
};

const loadStateOptions = () => Promise.resolve(stateOptions);

const loadDistrictOptions = (stateCode: string) => Promise.resolve(districtOptionsByState[stateCode] ?? []);

const filledPersonalInformation: PersonalInformation = {
  firstName: 'Brooklyn',
  lastName: 'Simmons',
  mobileNumber: '9876543210',
  email: 'brooklyn.s@example.com',
  dateOfBirth: '1992-07-10',
  gender: 'Female',
  nationality: 'Indian',
  maritalStatus: 'Single',
  aadhaarNumber: '123456789012',
  currentAddress: '2464 Royal Ln., Apt 12',
  currentCity: 'Bengaluru',
  currentState: 'KA',
  currentDistrictCode: '525',
  currentPinCode: '560034',
  sameAsCurrentAddress: false,
  permanentAddress: '18 Nehru Street',
  permanentCity: 'Chennai',
  permanentState: 'TN',
  permanentDistrictCode: '568',
  permanentPinCode: '600001',
  emergencyContactName: 'Robert Simmons',
  emergencyRelationship: 'Father',
  emergencyPhoneNumber: '9123456789',
  emergencyAddress: '18 Nehru Street, Chennai, Tamil Nadu',
};

const meta = {
  title: 'components/PersonalInformationForm',
  component: PersonalInformationForm,
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
    loadStateOptions: { control: false },
    loadDistrictOptions: { control: false },
  },
  args: {
    onSubmit: fn(),
    loadStateOptions,
    loadDistrictOptions,
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
} satisfies Meta<typeof PersonalInformationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The blank form, as it appears on the first step of the employee wizard.
 */
export const Default: Story = {};

/**
 * Restored from the store, the way the step looks when the user navigates back to it.
 */
export const Prefilled: Story = {
  beforeEach: () => {
    useEmployeeStore.setState({ personalInformation: filledPersonalInformation });
  },
};

/**
 * The district dropdown is scoped to the state above it: it stays closed until a state is
 * picked, and then offers only that state's districts.
 */
export const DependentDistrictDropdown: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const districtTrigger = canvas.getByRole('button', { name: 'Select Current District' });

    await expect(districtTrigger).toBeDisabled();

    await userEvent.click(canvas.getByRole('button', { name: 'Select Current State' }));
    await userEvent.click(await canvas.findByRole('button', { name: 'Karnataka' }));

    await waitFor(() => expect(districtTrigger).toBeEnabled());

    await userEvent.click(districtTrigger);

    await expect(await canvas.findByRole('button', { name: 'Bengaluru Urban' })).toBeInTheDocument();
  },
};

/**
 * Submitting an empty form surfaces the Zod messages against every required field.
 */
export const WithValidationErrors: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));

    await expect(await canvas.findByText('First Name is required')).toBeInTheDocument();

    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};
