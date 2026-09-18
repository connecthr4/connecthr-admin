import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import InitiateSeparationForm from './InitiateSeparationForm';
import { ROLES } from '@/src/lib/auth/roles';

import type { User } from '@/src/lib/types/auth';
import type { SeparationEmployee } from '@/src/lib/types/separation';

const employee: SeparationEmployee = {
  id: 'clx-employee-1',
  employeeId: 'EMP0007',
  name: 'Ada Lovelace',
  avatar: '',
  department: 'Engineering',
  designation: 'Senior Engineer',
  dateOfJoining: '2021-04-12',
};

const currentUser: User = {
  id: 'clx-current',
  name: 'Jane Doe',
  email: 'jane@example.com',
  role: ROLES.ADMIN,
  status: 'ACTIVE',
  mustChangePassword: false,
};

const meta = {
  title: 'components/InitiateSeparationForm',
  component: InitiateSeparationForm,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    employee,
    currentUser,
  },
} satisfies Meta<typeof InitiateSeparationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * How the screen looks when it is reached from the sidebar rather than from a row action:
 * there is no employee to file a separation against yet.
 */
export const WithoutAnEmployee: Story = {
  args: {
    employee: null,
  },
};
