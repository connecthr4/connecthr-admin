import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import MarkAttendanceDashboard from './MarkAttendanceDashboard';
import { ROLES } from '@/src/lib/auth/roles';
import { FALLBACK_ATTENDANCE_STATUS_OPTIONS } from '@/src/constants/attendance';
import type { User } from '@/src/lib/types/auth';
import type { DropdownOption } from '../Dropdown/Dropdown';

const currentUser: User = {
  id: 'clx-current',
  name: 'Jane Doe',
  email: 'jane@example.com',
  role: ROLES.ADMIN,
  status: 'ACTIVE',
  mustChangePassword: false,
};

const departments: DropdownOption[] = [
  { label: 'Design', value: 'Design' },
  { label: 'Development', value: 'Development' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Sales', value: 'Sales' },
];

const shifts: DropdownOption[] = [
  { label: 'General', value: 'GEN' },
  { label: 'Night', value: 'NGT' },
];

/*
The screen reads the day's sheet through a Server Function on mount. Storybook
has no backend behind it, so the read fails and the sheet settles on its empty
state — the filters, the View/Reset flow and the footer actions are what this
story is for.
*/
const meta = {
  title: 'components/MarkAttendanceDashboard',
  component: MarkAttendanceDashboard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    currentUser,
    departments,
    shifts,
    statuses: FALLBACK_ATTENDANCE_STATUS_OPTIONS,
  },
} satisfies Meta<typeof MarkAttendanceDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutOptions: Story = {
  args: {
    departments: [],
    shifts: [],
    statuses: [],
  },
};

export const SignedOut: Story = {
  args: {
    currentUser: null,
  },
};
