import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import AttendanceListDashboard from './AttendanceListDashboard';
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

/*
The screen reads the day's sheet through a Server Function on mount. Storybook
has no backend behind it, so the read fails and the table settles on its empty
state — the layout, filters, summary cards and export flow are what this story
is for.
*/
const meta = {
  title: 'components/AttendanceListDashboard',
  component: AttendanceListDashboard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    currentUser,
    departments,
    statuses: FALLBACK_ATTENDANCE_STATUS_OPTIONS,
  },
} satisfies Meta<typeof AttendanceListDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutDepartments: Story = {
  args: {
    departments: [],
  },
};

export const SignedOut: Story = {
  args: {
    currentUser: null,
  },
};
