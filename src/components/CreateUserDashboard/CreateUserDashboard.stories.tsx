import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import CreateUserDashboard from './CreateUserDashboard';
import { ROLES } from '@/src/lib/auth/roles';

import type { User } from '@/src/lib/types/auth';

const currentUser: User = {
  id: 'clx-current',
  name: 'Shailesh',
  email: 'shailesh@example.com',
  role: ROLES.IT,
  status: 'ACTIVE',
  mustChangePassword: false,
};

const meta = {
  title: 'components/CreateUserDashboard',
  component: CreateUserDashboard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    assignableRoles: {
      control: 'object',
      description: 'Roles the signed-in account may assign, from /users/assignable-roles.',
    },
  },
  args: {
    currentUser,
  },
} satisfies Meta<typeof CreateUserDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * What an IT account sees — it may create both Super Admins and Admins.
 */
export const ItAccount: Story = {
  args: {
    assignableRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
};

/**
 * A Super Admin may only create Admins, so the dropdown holds a single option.
 */
export const SuperAdminAccount: Story = {
  args: {
    assignableRoles: [ROLES.ADMIN],
    currentUser: { ...currentUser, role: ROLES.SUPER_ADMIN },
  },
};

/**
 * Defensive case: the form explains itself rather than rendering a dropdown
 * with nothing in it.
 */
export const NoAssignableRoles: Story = {
  args: {
    assignableRoles: [],
  },
};
