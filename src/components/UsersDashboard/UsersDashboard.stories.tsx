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
    /* The signed-in account's own row — never deletable, whoever is looking. */
    id: 'clx-current',
    name: 'Shailesh',
    email: 'shailesh@example.com',
    role: ROLES.IT,
    status: 'ACTIVE',
    lastLoginAt: '2026-08-15T07:02:00.000Z',
    createdAt: '2026-06-01T09:00:00.000Z',
    createdBy: null,
  },
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
    /* A second Super Admin, so `AsSuperAdmin` has a peer to *not* be able to delete. */
    id: 'clx-4',
    name: 'Nithya P',
    email: 'nithya@example.com',
    role: ROLES.SUPER_ADMIN,
    status: 'ACTIVE',
    lastLoginAt: '2026-08-12T11:30:00.000Z',
    createdAt: '2026-07-02T09:15:00.000Z',
    createdBy: { id: 'clx-current', name: 'Shailesh' },
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
    /* What IT is handed. A Super Admin gets `["ADMIN"]` — see `AsSuperAdmin`. */
    assignableRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    currentUser,
  },
} satisfies Meta<typeof UsersDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Signed in as IT: every status the backend reports, a row with no creator,
 * and a delete action on everything except IT's own row.
 */
export const Default: Story = {};

/**
 * Signed in as a Super Admin, whose assignable roles are `["ADMIN"]` alone.
 * The Admin rows offer a delete; the peer Super Admin and the IT row do not,
 * which is the rank rule falling out of the roles list rather than being
 * re-derived here.
 */
export const AsSuperAdmin: Story = {
  args: {
    assignableRoles: [ROLES.ADMIN],
    currentUser: { ...currentUser, id: 'clx-2', name: 'Ravi K', role: ROLES.SUPER_ADMIN },
  },
};

/**
 * The `assignable-roles` lookup failed, so no row offers a delete and the
 * column is dropped rather than rendered empty.
 */
export const WithoutDeletePermission: Story = {
  args: {
    assignableRoles: [],
  },
};

/**
 * Before anyone has been created through the admin UI.
 */
export const Empty: Story = {
  args: {
    initialUsers: [],
  },
};
