import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CreateUserDashboard from './CreateUserDashboard';
import { UsersClient } from '@/src/lib/api/usersClient';
import { logoutAction } from '@/src/lib/actions/auth';
import { ROLES } from '@/src/lib/auth/roles';
import { ROUTES } from '@/src/constants/strings';

import type { User } from '@/src/lib/types/auth';
import type { UsersClientError } from '@/src/lib/api/usersClient';
import type { CreatedUser } from '@/src/lib/types/users';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@/src/lib/logger', () => ({
  logger: {
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  },
}));

const clearAuthMock = vi.fn();
const authState = { clearAuth: clearAuthMock };

vi.mock('@/src/store/auth', () => ({
  useAuthStore: (selector: (state: typeof authState) => unknown) => selector(authState),
}));

const showNotificationMock = vi.fn();

vi.mock('@/src/providers/NotificationProvider', () => ({
  useNotification: () => ({ showNotification: showNotificationMock }),
}));

/*
`src/lib/actions/auth` pulls in `server-only` and `next/headers`, neither of
which resolve under jsdom — and the forced-logout path only needs to know the
action was called.
*/
vi.mock('@/src/lib/actions/auth', () => ({
  logoutAction: vi.fn(),
}));

vi.mock('@/src/lib/api/usersClient', () => ({
  UsersClient: { createUser: vi.fn() },
}));

const currentUser: User = {
  id: 'clx-current',
  name: 'Jane Doe',
  email: 'jane@example.com',
  role: ROLES.IT,
  status: 'ACTIVE',
  mustChangePassword: false,
};

const createdUser: CreatedUser = {
  id: 'clx-new',
  name: 'John Smith',
  email: 'john@example.com',
  role: ROLES.ADMIN,
  temporaryPassword: 'Temp!2345',
};

/**
 * Builds the shape `UsersClient` throws — a plain `Error` carrying the API's
 * error `code`, which is what the form branches on.
 */
function apiError(code: string, message = 'Request failed'): UsersClientError {
  const error = new Error(message) as UsersClientError;

  error.code = code;

  return error;
}

const writeTextMock = vi.fn();

/*
`userEvent.setup()` installs a clipboard stub of its own, so this has to be
applied after it — otherwise the component's writes land on user-event's stub
and never reach the mock.
*/
function stubClipboard() {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: writeTextMock },
    configurable: true,
    writable: true,
  });
}

function renderDashboard(props: Partial<React.ComponentProps<typeof CreateUserDashboard>> = {}) {
  return render(
    <CreateUserDashboard
      assignableRoles={props.assignableRoles ?? [ROLES.SUPER_ADMIN, ROLES.ADMIN]}
      currentUser={props.currentUser ?? currentUser}
    />
  );
}

/**
 * Fills the form with valid values and submits it.
 */
async function submitValidForm(
  user: ReturnType<typeof userEvent.setup>,
  name = 'John Smith',
  email = 'john@example.com'
) {
  await user.type(screen.getByPlaceholderText('Enter full name'), name);
  await user.type(screen.getByPlaceholderText('Enter email address'), email);

  await user.click(screen.getByRole('button', { name: 'Select a role' }));
  await user.click(screen.getByRole('button', { name: 'Admin' }));

  await user.click(screen.getByRole('button', { name: 'Create' }));
}

describe('CreateUserDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('form', () => {
    it('renders the header and the empty form', () => {
      renderDashboard();

      expect(screen.getByRole('heading', { name: 'Create User' })).toBeInTheDocument();
      expect(screen.getByText('Add New User')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter full name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter email address')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Select a role' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    });

    it('offers every assignable role in the dropdown', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'Select a role' }));

      expect(screen.getByRole('button', { name: 'Super Admin' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Admin' })).toBeInTheDocument();
    });

    it('never offers IT, even when the API returns it', async () => {
      const user = userEvent.setup();
      renderDashboard({ assignableRoles: [ROLES.IT, ROLES.ADMIN] });

      await user.click(screen.getByRole('button', { name: 'Select a role' }));

      expect(screen.getByRole('button', { name: 'Admin' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'IT' })).not.toBeInTheDocument();
    });

    it('explains itself instead of rendering an empty dropdown when no role is assignable', () => {
      renderDashboard({ assignableRoles: [] });

      expect(screen.getByText('Your account cannot assign any roles.')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Enter full name')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Create' })).not.toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('shows an error for every empty field and does not call the API', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'Create' }));

      expect(await screen.findByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email address is required')).toBeInTheDocument();
      expect(screen.getByText('Role is required')).toBeInTheDocument();
      expect(UsersClient.createUser).not.toHaveBeenCalled();
    });

    it('rejects a malformed email address', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.type(screen.getByPlaceholderText('Enter full name'), 'John Smith');
      await user.type(screen.getByPlaceholderText('Enter email address'), 'not-an-email');
      await user.click(screen.getByRole('button', { name: 'Create' }));

      expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument();
      expect(UsersClient.createUser).not.toHaveBeenCalled();
    });

    it('clears a field error as soon as that field is edited', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'Create' }));
      expect(await screen.findByText('Name is required')).toBeInTheDocument();

      await user.type(screen.getByPlaceholderText('Enter full name'), 'J');

      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
      expect(screen.getByText('Email address is required')).toBeInTheDocument();
    });

    it('clears the role error once a role is picked', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'Create' }));
      expect(await screen.findByText('Role is required')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Select a role' }));
      await user.click(screen.getByRole('button', { name: 'Admin' }));

      expect(screen.queryByText('Role is required')).not.toBeInTheDocument();
    });
  });

  describe('submission', () => {
    it('trims the submitted values and sends the selected role', async () => {
      const user = userEvent.setup();
      vi.mocked(UsersClient.createUser).mockResolvedValue({ success: true, message: 'ok', data: createdUser });

      renderDashboard();

      await submitValidForm(user, '  John Smith  ');

      await waitFor(() =>
        expect(UsersClient.createUser).toHaveBeenCalledWith({
          name: 'John Smith',
          email: 'john@example.com',
          role: ROLES.ADMIN,
        })
      );
    });

    /*
    `validate` runs on the raw email while the payload is trimmed, so padding
    is rejected up front rather than quietly accepted — pinned here because
    the two halves disagreeing is exactly what would go unnoticed.
    */
    it('rejects a padded email address before reaching the API', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await submitValidForm(user, 'John Smith', '  john@example.com  ');

      expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument();
      expect(UsersClient.createUser).not.toHaveBeenCalled();
    });

    it('shows a success notification and swaps the form for the created-user panel', async () => {
      const user = userEvent.setup();
      vi.mocked(UsersClient.createUser).mockResolvedValue({ success: true, message: 'ok', data: createdUser });

      renderDashboard();

      await submitValidForm(user);

      expect(await screen.findByRole('heading', { name: 'User created successfully' })).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Temp!2345')).toBeInTheDocument();
      expect(
        screen.getByText(
          'This password is shown once and cannot be retrieved again. Copy it now and share it with the user securely.'
        )
      ).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Enter full name')).not.toBeInTheDocument();

      expect(showNotificationMock).toHaveBeenCalledWith(
        'User created successfully',
        '',
        'success',
        5000,
        'top-right',
        false
      );
    });

    it('routes a duplicate email to the email field rather than a notification', async () => {
      const user = userEvent.setup();
      vi.mocked(UsersClient.createUser).mockRejectedValue(apiError('USER_EMAIL_ALREADY_EXISTS'));

      renderDashboard();

      await submitValidForm(user);

      expect(await screen.findByText('An account with this email already exists')).toBeInTheDocument();
      expect(showNotificationMock).not.toHaveBeenCalled();
      expect(screen.getByPlaceholderText('Enter full name')).toBeInTheDocument();
    });

    it('forces a logout when the acting account is no longer active', async () => {
      const user = userEvent.setup();
      vi.mocked(UsersClient.createUser).mockRejectedValue(apiError('ACCOUNT_NOT_ACTIVE'));

      renderDashboard();

      await submitValidForm(user);

      await waitFor(() => expect(logoutAction).toHaveBeenCalled());
      expect(clearAuthMock).toHaveBeenCalled();
      expect(showNotificationMock).not.toHaveBeenCalled();
    });

    it('shows a plain denial without the API detail when permissions are insufficient', async () => {
      const user = userEvent.setup();
      vi.mocked(UsersClient.createUser).mockRejectedValue(
        apiError('INSUFFICIENT_PERMISSIONS', 'You cannot assign this role')
      );

      renderDashboard();

      await submitValidForm(user);

      await waitFor(() =>
        expect(showNotificationMock).toHaveBeenCalledWith('User creation failed', '', 'error', 5000, 'top-right', false)
      );
      expect(clearAuthMock).not.toHaveBeenCalled();
    });

    it('shows the API message for an unrecognised failure', async () => {
      const user = userEvent.setup();
      vi.mocked(UsersClient.createUser).mockRejectedValue(apiError('SOMETHING_ELSE', 'Backend unavailable'));

      renderDashboard();

      await submitValidForm(user);

      await waitFor(() =>
        expect(showNotificationMock).toHaveBeenCalledWith(
          'User creation failed',
          'Backend unavailable',
          'error',
          5000,
          'top-right',
          false
        )
      );
      expect(screen.getByPlaceholderText('Enter full name')).toBeInTheDocument();
    });
  });

  describe('created-user panel', () => {
    beforeEach(() => {
      vi.mocked(UsersClient.createUser).mockResolvedValue({ success: true, message: 'ok', data: createdUser });
    });

    it('copies the temporary password to the clipboard', async () => {
      const user = userEvent.setup();
      stubClipboard();
      writeTextMock.mockResolvedValue(undefined);

      renderDashboard();
      await submitValidForm(user);

      await user.click(await screen.findByRole('button', { name: 'Copy' }));

      expect(writeTextMock).toHaveBeenCalledWith('Temp!2345');
      expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
    });

    it('tells the reader to copy by hand when the clipboard is refused', async () => {
      const user = userEvent.setup();
      stubClipboard();
      writeTextMock.mockRejectedValue(new Error('Permission denied'));

      renderDashboard();
      await submitValidForm(user);

      await user.click(await screen.findByRole('button', { name: 'Copy' }));

      expect(await screen.findByText('Could not copy — select the password and copy it manually.')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Copied' })).not.toBeInTheDocument();
    });

    it('returns to a blank form on "Create Another User"', async () => {
      const user = userEvent.setup();

      renderDashboard();
      await submitValidForm(user);

      await user.click(await screen.findByRole('button', { name: 'Create Another User' }));

      expect(screen.getByPlaceholderText('Enter full name')).toHaveValue('');
      expect(screen.getByPlaceholderText('Enter email address')).toHaveValue('');
      expect(screen.getByRole('button', { name: 'Select a role' })).toBeInTheDocument();
      expect(screen.queryByText('Temp!2345')).not.toBeInTheDocument();
    });

    it('navigates to the users list on "Back to Users"', async () => {
      const user = userEvent.setup();

      renderDashboard();
      await submitValidForm(user);

      await user.click(await screen.findByRole('button', { name: 'Back to Users' }));

      expect(pushMock).toHaveBeenCalledWith(ROUTES.USERS);
    });
  });
});
