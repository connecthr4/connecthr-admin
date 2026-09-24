import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import UsersDashboard from './UsersDashboard';
import { deleteUser } from '@/src/lib/actions/users';
import { ROLES } from '@/src/lib/auth/roles';
import { ROUTES, STRINGS } from '@/src/constants/strings';

import type { Role } from '@/src/lib/auth/roles';
import type { User } from '@/src/lib/types/auth';
import type { ManagedUser } from '@/src/lib/types/users';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

/*
The header chip renders `UserMenu` for real; only its Server Action dependency
is stubbed, since `src/lib/actions/auth` pulls in `server-only` and
`next/headers`, neither of which resolve under jsdom.
*/
vi.mock('@/src/lib/actions/auth', () => ({
  logoutAction: vi.fn(),
}));

/* Same reason — and here the test only needs to know what the action was asked to delete. */
vi.mock('@/src/lib/actions/users', () => ({
  deleteUser: vi.fn(),
}));

const showNotificationMock = vi.fn();

vi.mock('@/src/providers/NotificationProvider', () => ({
  useNotification: () => ({ showNotification: showNotificationMock }),
}));

const deleteUserMock = vi.mocked(deleteUser);

/* What IT is handed by `/users/assignable-roles`. */
const IT_ASSIGNABLE_ROLES: Role[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

const currentUser: User = {
  id: 'clx-current',
  name: 'Jane Doe',
  email: 'jane@example.com',
  role: ROLES.IT,
  status: 'ACTIVE',
  mustChangePassword: false,
};

const users: ManagedUser[] = [
  {
    /* The signed-in account's own row. */
    id: 'clx-current',
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: ROLES.IT,
    status: 'ACTIVE',
    lastLoginAt: '2026-08-15T07:02:00.000Z',
    createdAt: '2026-06-01T09:00:00.000Z',
    createdBy: null,
  },
  {
    /* Another IT account — nothing outranks IT, so no caller may delete it. */
    id: 'clx-it',
    name: 'Dev Ops',
    email: 'devops@example.com',
    role: ROLES.IT,
    status: 'ACTIVE',
    lastLoginAt: '2026-08-10T12:00:00.000Z',
    createdAt: '2026-06-01T09:05:00.000Z',
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
    createdBy: { id: 'clx-current', name: 'Jane Doe' },
  },
  {
    id: 'clx-2',
    name: 'Ravi K',
    email: 'ravi@example.com',
    role: ROLES.SUPER_ADMIN,
    status: 'LOCKED',
    /* Never signed in, and predates the `createdBy` column. */
    lastLoginAt: null,
    createdAt: '2026-08-13T10:00:00.000Z',
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

/**
 * Builds `count` rows that differ only by index, for the pagination cases.
 */
function manyUsers(count: number): ManagedUser[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `clx-${index}`,
    name: `Person ${index}`,
    email: `person${index}@example.com`,
    role: ROLES.ADMIN,
    status: 'ACTIVE' as const,
    lastLoginAt: null,
    createdAt: '2026-08-14T08:55:00.000Z',
    createdBy: null,
  }));
}

function renderDashboard(
  initialUsers: ManagedUser[] = users,
  user: User | null = currentUser,
  assignableRoles: Role[] = IT_ASSIGNABLE_ROLES
) {
  return render(<UsersDashboard initialUsers={initialUsers} assignableRoles={assignableRoles} currentUser={user} />);
}

/**
 * The delete control on a given row, or `null` where the row offers none.
 */
function deleteActionFor(email: string) {
  return within(rowFor(email)).queryByRole('button', { name: /^Delete / });
}

/**
 * The row for a given account. Anchored on the email rather than the name,
 * since a name also shows up in the "Created By" cell of the rows that
 * account created.
 */
function rowFor(email: string) {
  return screen.getByRole('cell', { name: email }).closest('tr') as HTMLTableRowElement;
}

describe('UsersDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('layout', () => {
    it('renders the header and the create-user action', () => {
      renderDashboard();

      expect(screen.getByRole('heading', { name: 'Users' })).toBeInTheDocument();
      expect(screen.getByText('All user accounts')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create User' })).toBeInTheDocument();
    });

    it('renders every column header', () => {
      renderDashboard();

      const headers = screen.getAllByRole('columnheader').map((header) => header.textContent);

      expect(headers).toEqual(['Name', 'Email', 'Role', 'Status', 'Last Login', 'Created By', 'Actions']);
    });

    it('drops the actions column for an account that can delete nobody', () => {
      renderDashboard(users, currentUser, []);

      const headers = screen.getAllByRole('columnheader').map((header) => header.textContent);

      expect(headers).toEqual(['Name', 'Email', 'Role', 'Status', 'Last Login', 'Created By']);
      expect(screen.queryByRole('button', { name: /^Delete / })).not.toBeInTheDocument();
    });

    it('navigates to the create-user page from the top bar', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'Create User' }));

      expect(pushMock).toHaveBeenCalledWith(ROUTES.CREATE_USER);
    });

    it('renders the signed-in account in the header chip', () => {
      renderDashboard();

      expect(within(screen.getByRole('button', { name: 'Account menu' })).getByText('Jane Doe')).toBeInTheDocument();
      expect(within(screen.getByRole('button', { name: 'Account menu' })).getByText('IT')).toBeInTheDocument();
    });
  });

  describe('rows', () => {
    it('renders a row per account', () => {
      renderDashboard();

      /* One header row plus one row per account. */
      expect(screen.getAllByRole('row')).toHaveLength(users.length + 1);
      expect(rowFor('asha@example.com')).toBeInTheDocument();
      expect(rowFor('ravi@example.com')).toBeInTheDocument();
      expect(rowFor('meera@example.com')).toBeInTheDocument();
    });

    it('renders the account details in the right cells', () => {
      renderDashboard();

      const row = within(rowFor('asha@example.com'));

      expect(row.getByText('asha@example.com')).toBeInTheDocument();
      expect(row.getByText('Admin')).toBeInTheDocument();
      expect(row.getByText('ACTIVE')).toBeInTheDocument();
      expect(row.getByText('August 14, 2026')).toBeInTheDocument();
      expect(row.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('shows the role label rather than the raw enum value', () => {
      renderDashboard();

      expect(within(rowFor('ravi@example.com')).getByText('Super Admin')).toBeInTheDocument();
      expect(within(rowFor('ravi@example.com')).queryByText('SUPER_ADMIN')).not.toBeInTheDocument();
    });

    it('reads "Never" for an account that has not signed in', () => {
      renderDashboard();

      expect(within(rowFor('ravi@example.com')).getByText('Never')).toBeInTheDocument();
    });

    it('renders a dash rather than "Unknown" when the creator is not recorded', () => {
      renderDashboard();

      expect(within(rowFor('ravi@example.com')).getByText('--')).toBeInTheDocument();
      expect(within(rowFor('ravi@example.com')).queryByText('Unknown')).not.toBeInTheDocument();
    });

    it('renders the recorded creator for accounts made through the UI', () => {
      renderDashboard();

      expect(within(rowFor('meera@example.com')).getByText('Ravi K')).toBeInTheDocument();
    });

    it('renders each status as its own badge', () => {
      renderDashboard();

      expect(within(rowFor('asha@example.com')).getByText('ACTIVE')).toBeInTheDocument();
      expect(within(rowFor('ravi@example.com')).getByText('LOCKED')).toBeInTheDocument();
      expect(within(rowFor('meera@example.com')).getByText('DISABLED')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows the empty state and no footer when there are no accounts', () => {
      renderDashboard([]);

      expect(screen.getByText('No data found')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Next page' })).not.toBeInTheDocument();
      expect(screen.queryByText(/out of/)).not.toBeInTheDocument();

      /* The create-user action stays available with nothing to list. */
      expect(screen.getByRole('button', { name: 'Create User' })).toBeInTheDocument();
    });
  });

  describe('pagination', () => {
    it('paginates locally at ten rows a page', () => {
      renderDashboard(manyUsers(12));

      expect(screen.getAllByRole('row')).toHaveLength(11);
      expect(screen.getByRole('cell', { name: 'Person 0' })).toBeInTheDocument();
      expect(screen.queryByRole('cell', { name: 'Person 10' })).not.toBeInTheDocument();
      expect(screen.getByText('Showing 1 to 10 out of 12 records')).toBeInTheDocument();
    });

    it('shows the remaining accounts on the next page', async () => {
      const user = userEvent.setup();
      renderDashboard(manyUsers(12));

      await user.click(screen.getByRole('button', { name: 'Next page' }));

      expect(screen.getByRole('cell', { name: 'Person 10' })).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: 'Person 11' })).toBeInTheDocument();
      expect(screen.queryByRole('cell', { name: 'Person 0' })).not.toBeInTheDocument();
      expect(screen.getByText('Showing 11 to 12 out of 12 records')).toBeInTheDocument();
    });

    it('leaves a single page unpaginated', () => {
      renderDashboard();

      expect(screen.getByText(`Showing 1 to ${users.length} out of ${users.length} records`)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    });
  });

  describe('delete action', () => {
    it('offers a delete on the rows whose role the caller may act on', () => {
      renderDashboard();

      expect(deleteActionFor('asha@example.com')).toBeInTheDocument();
      expect(deleteActionFor('meera@example.com')).toBeInTheDocument();
      expect(deleteActionFor('ravi@example.com')).toBeInTheDocument();
    });

    it('names the account in the action so the control is not just a bin', () => {
      renderDashboard();

      expect(deleteActionFor('asha@example.com')).toHaveAccessibleName('Delete Asha R');
    });

    it('hides the action on IT rows, which nothing outranks', () => {
      renderDashboard();

      expect(deleteActionFor('devops@example.com')).not.toBeInTheDocument();
    });

    it('hides the action on the signed-in account own row', () => {
      renderDashboard();

      expect(deleteActionFor('jane@example.com')).not.toBeInTheDocument();
    });

    it('hides the action on a peer, since a role is never in its own assignable list', () => {
      /* Signed in as Ravi, a Super Admin, who may act on Admins alone. */
      const superAdmin: User = { ...currentUser, id: 'clx-2', name: 'Ravi K', role: ROLES.SUPER_ADMIN };

      renderDashboard(users, superAdmin, [ROLES.ADMIN]);

      expect(deleteActionFor('asha@example.com')).toBeInTheDocument();
      expect(deleteActionFor('ravi@example.com')).not.toBeInTheDocument();
      expect(deleteActionFor('devops@example.com')).not.toBeInTheDocument();
    });
  });

  describe('delete confirmation', () => {
    beforeEach(() => {
      deleteUserMock.mockResolvedValue({ success: true, message: 'User deleted successfully.' });
    });

    it('asks before deleting, naming the account and what survives it', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(deleteActionFor('asha@example.com')!);

      const dialog = within(screen.getByRole('dialog'));

      expect(dialog.getByRole('heading', { name: STRINGS.DELETE_USER })).toBeInTheDocument();
      expect(dialog.getByText(STRINGS.DELETE_USER_CONFIRMATION)).toBeInTheDocument();
      expect(dialog.getByText('Asha R')).toBeInTheDocument();
      expect(dialog.getByText('asha@example.com · Admin')).toBeInTheDocument();
      expect(deleteUserMock).not.toHaveBeenCalled();
    });

    it('deletes nothing when the confirmation is dismissed', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(deleteActionFor('asha@example.com')!);
      await user.click(screen.getByRole('button', { name: STRINGS.CANCEL }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(deleteUserMock).not.toHaveBeenCalled();
    });

    it('deletes the confirmed account and reports it', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(deleteActionFor('asha@example.com')!);
      await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: STRINGS.DELETE }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

      expect(deleteUserMock).toHaveBeenCalledWith('clx-1');
      expect(showNotificationMock).toHaveBeenCalledWith(
        STRINGS.USER_DELETED_SUCCESSFULLY,
        'Asha R',
        'success',
        5000,
        'top-right',
        false
      );
    });

    it('keeps the confirmation open and reports the reason when the delete fails', async () => {
      const user = userEvent.setup();

      deleteUserMock.mockResolvedValue({ success: false, message: 'You cannot delete this user.' });
      renderDashboard();

      await user.click(deleteActionFor('ravi@example.com')!);
      await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: STRINGS.DELETE }));

      await waitFor(() =>
        expect(showNotificationMock).toHaveBeenCalledWith(
          STRINGS.USER_DELETION_FAILED,
          'You cannot delete this user.',
          'error',
          5000,
          'top-right',
          false
        )
      );

      /* The row is still there, and so is the decision the user came to make. */
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('falls back to placeholder details when no signed-in user is passed', () => {
    renderDashboard(users, null);

    const chip = within(screen.getByRole('button', { name: 'Account menu' }));

    expect(chip.getByText('User')).toBeInTheDocument();
    expect(chip.getByText('Admin')).toBeInTheDocument();
  });
});
