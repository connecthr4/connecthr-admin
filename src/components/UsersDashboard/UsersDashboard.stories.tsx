import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import UsersDashboard from './UsersDashboard';
import { ROLES } from '@/src/lib/auth/roles';

import type { User } from '@/src/lib/types/auth';
import type { ManagedUser } from '@/src/lib/types/users';

const currentUser: User = {
  id: 'clx-current',
  name: 'Shailesh',
  email: 'shailesh@example.com',
  role: ROLES.IT,
  status: 'ACTIVE',
  mustChangePassword: false,
};

const users: ManagedUser[] = [
  {
    id: 'clx-1',
    name: 'Asha R',
    email: 'asha@example.com',
    role: ROLES.ADMIN,
    status: 'ACTIVE',
    lastLoginAt: '2026-08-14T09:12:00.000Z',
    createdAt: '2026-08-14T08:55:00.000Z',
    createdBy: { id: 'clx-current', name: 'Shailesh' },
  },
  {
    id: 'clx-2',
    name: 'Ravi K',
    email: 'ravi@example.com',
    role: ROLES.SUPER_ADMIN,
    status: 'LOCKED',
    lastLoginAt: null,
    createdAt: '2026-08-13T10:00:00.000Z',
    /* Predates the column, so it renders as a dash rather than "Unknown". */
    createdBy: null,
  },
  {
    id: 'clx-3',
    name: 'Meera S',
    email: 'meera@example.com',
    role: ROLES.ADMIN,
    status: 'DISABLED',
    lastLoginAt: '2026-07-30T15:41:00.000Z',
    createdAt: '2026-07-29T11:20:00.000Z',
    createdBy: { id: 'clx-2', name: 'Ravi K' },
  },
];

const meta = {
  title: 'components/UsersDashboard',
  component: UsersDashboard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    initialUsers: users,
    currentUser,
  },
} satisfies Meta<typeof UsersDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Every status the backend reports, plus a row with no creator.
 */
export const Default: Story = {};

/**
 * Before anyone has been created through the admin UI.
 */
export const Empty: Story = {
  args: {
    initialUsers: [],
  },
};
