import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LoginPanel from './LoginPanel';
import { AuthApi } from '@/src/lib/api/auth';
import { ROUTES } from '@/src/constants/strings';

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

const loginMock = vi.fn();
const setTempPasswordMock = vi.fn();
const authState = {
  login: loginMock,
  setTempPassword: setTempPasswordMock,
  tempPassword: 'temp-pass' as string | null,
};

vi.mock('@/src/store/auth', () => ({
  useAuthStore: (selector: (state: typeof authState) => unknown) => selector(authState),
}));

const showNotificationMock = vi.fn();

vi.mock('@/src/providers/NotificationProvider', () => ({
  useNotification: () => ({ showNotification: showNotificationMock }),
}));

vi.mock('@/src/lib/api/auth', () => ({
  AuthApi: {
    login: vi.fn(),
    changePassword: vi.fn(),
  },
}));

const mockUser = {
  id: '1',
  name: 'Jane Doe',
  email: 'jane@example.com',
  status: 'active',
  mustChangePassword: false,
};

describe('LoginPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.tempPassword = 'temp-pass';
  });

  describe('login step', () => {
    it('renders the login form', () => {
      render(<LoginPanel step="login" />);

      expect(screen.getByText('connectHR')).toBeInTheDocument();
      expect(screen.getByText('Welcome')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter email address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    it('shows validation errors when submitting empty fields', async () => {
      const user = userEvent.setup();
      render(<LoginPanel step="login" />);

      await user.click(screen.getByRole('button', { name: 'Login' }));

      expect(await screen.findByText('Email address is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(AuthApi.login).not.toHaveBeenCalled();
    });

    it('shows an error for an invalid email address', async () => {
      const user = userEvent.setup();
      render(<LoginPanel step="login" />);

      await user.type(screen.getByPlaceholderText('Enter email address'), 'not-an-email');
      await user.type(screen.getByPlaceholderText('Enter password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Login' }));

      expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument();
      expect(AuthApi.login).not.toHaveBeenCalled();
    });

    it('clears a field error as soon as the user edits that field', async () => {
      const user = userEvent.setup();
      render(<LoginPanel step="login" />);

      await user.click(screen.getByRole('button', { name: 'Login' }));
      expect(await screen.findByText('Email address is required')).toBeInTheDocument();

      await user.type(screen.getByPlaceholderText('Enter email address'), 'a');
      expect(screen.queryByText('Email address is required')).not.toBeInTheDocument();
    });

    it('logs in and redirects to the dashboard when no password change is required', async () => {
      const user = userEvent.setup();
      vi.mocked(AuthApi.login).mockResolvedValue({
        success: true,
        message: 'ok',
        data: { accessToken: 'token', user: mockUser },
      });

      render(<LoginPanel step="login" />);

      await user.type(screen.getByPlaceholderText('Enter email address'), 'jane@example.com');
      await user.type(screen.getByPlaceholderText('Enter password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() =>
        expect(AuthApi.login).toHaveBeenCalledWith({ email: 'jane@example.com', password: 'password123' })
      );
      expect(loginMock).toHaveBeenCalledWith({ accessToken: 'token', user: mockUser });
      expect(setTempPasswordMock).not.toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith(ROUTES.DASHBOARD);
    });

    it('redirects to reset password and stores the temp password when a password change is required', async () => {
      const user = userEvent.setup();
      vi.mocked(AuthApi.login).mockResolvedValue({
        success: true,
        message: 'ok',
        data: { accessToken: 'token', user: { ...mockUser, mustChangePassword: true } },
      });

      render(<LoginPanel step="login" />);

      await user.type(screen.getByPlaceholderText('Enter email address'), 'jane@example.com');
      await user.type(screen.getByPlaceholderText('Enter password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() => expect(setTempPasswordMock).toHaveBeenCalledWith('password123'));
      expect(pushMock).toHaveBeenCalledWith(ROUTES.RESET_PASSWORD);
    });

    it('shows a notification when login fails', async () => {
      const user = userEvent.setup();
      vi.mocked(AuthApi.login).mockRejectedValue(new Error('Invalid credentials'));

      render(<LoginPanel step="login" />);

      await user.type(screen.getByPlaceholderText('Enter email address'), 'jane@example.com');
      await user.type(screen.getByPlaceholderText('Enter password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() =>
        expect(showNotificationMock).toHaveBeenCalledWith(
          'Login Failed',
          'Invalid credentials',
          'error',
          5000,
          'top-right',
          false
        )
      );
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  describe('reset-password step', () => {
    it('renders the reset password form with password requirements', () => {
      render(<LoginPanel step="reset-password" />);

      expect(screen.getByRole('heading', { name: 'Reset Password' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter new password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm new password')).toBeInTheDocument();
      expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
      expect(screen.getByText('One uppercase letter')).toBeInTheDocument();
      expect(screen.getByText('One lowercase letter')).toBeInTheDocument();
      expect(screen.getByText('One number')).toBeInTheDocument();
      expect(screen.getByText('One special character')).toBeInTheDocument();
    });

    it('updates the password requirement checklist as the user types', async () => {
      const user = userEvent.setup();
      render(<LoginPanel step="reset-password" />);

      const newPasswordInput = screen.getByPlaceholderText('Enter new password');
      await user.type(newPasswordInput, 'Abcdef1!');

      const requirement = screen.getByText('At least 8 characters').closest('div');
      expect(requirement?.querySelector('svg')).toBeInTheDocument();
    });

    it('shows validation errors when submitting empty fields', async () => {
      const user = userEvent.setup();
      render(<LoginPanel step="reset-password" />);

      await user.click(screen.getByRole('button', { name: 'Reset Password' }));

      expect(await screen.findByText('New password is required')).toBeInTheDocument();
      expect(screen.getByText('Confirm password is required')).toBeInTheDocument();
      expect(AuthApi.changePassword).not.toHaveBeenCalled();
    });

    it('shows a minimum length error for a short new password', async () => {
      const user = userEvent.setup();
      render(<LoginPanel step="reset-password" />);

      await user.type(screen.getByPlaceholderText('Enter new password'), 'short');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'short');
      await user.click(screen.getByRole('button', { name: 'Reset Password' }));

      expect(await screen.findByText('Password must be at least 8 characters long')).toBeInTheDocument();
    });

    it('shows an error when the passwords do not match', async () => {
      const user = userEvent.setup();
      render(<LoginPanel step="reset-password" />);

      await user.type(screen.getByPlaceholderText('Enter new password'), 'Password1!');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'Password2!');
      await user.click(screen.getByRole('button', { name: 'Reset Password' }));

      expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
      expect(AuthApi.changePassword).not.toHaveBeenCalled();
    });

    it('resets the password and shows the success modal', async () => {
      const user = userEvent.setup();
      vi.mocked(AuthApi.changePassword).mockResolvedValue({ success: true, message: 'ok' });

      render(<LoginPanel step="reset-password" />);

      await user.type(screen.getByPlaceholderText('Enter new password'), 'Password1!');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'Password1!');
      await user.click(screen.getByRole('button', { name: 'Reset Password' }));

      await waitFor(() =>
        expect(AuthApi.changePassword).toHaveBeenCalledWith({
          newPassword: 'Password1!',
          confirmPassword: 'Password1!',
          currentPassword: 'temp-pass',
        })
      );

      expect(await screen.findByText('Password updated successfully.')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Back to Login' }));
      expect(pushMock).toHaveBeenCalledWith('/login');
      expect(screen.queryByText('Password updated successfully.')).not.toBeInTheDocument();
    });

    it('falls back to an empty current password when no temp password is stored', async () => {
      const user = userEvent.setup();
      authState.tempPassword = null;
      vi.mocked(AuthApi.changePassword).mockResolvedValue({ success: true, message: 'ok' });

      render(<LoginPanel step="reset-password" />);

      await user.type(screen.getByPlaceholderText('Enter new password'), 'Password1!');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'Password1!');
      await user.click(screen.getByRole('button', { name: 'Reset Password' }));

      await waitFor(() =>
        expect(AuthApi.changePassword).toHaveBeenCalledWith(expect.objectContaining({ currentPassword: '' }))
      );
    });

    it('shows a notification and logs the error when resetting the password fails', async () => {
      const user = userEvent.setup();
      vi.mocked(AuthApi.changePassword).mockRejectedValue(new Error('Reset failed'));

      render(<LoginPanel step="reset-password" />);

      await user.type(screen.getByPlaceholderText('Enter new password'), 'Password1!');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'Password1!');
      await user.click(screen.getByRole('button', { name: 'Reset Password' }));

      await waitFor(() =>
        expect(showNotificationMock).toHaveBeenCalledWith(
          'Password Reset Failed',
          'Reset failed',
          'error',
          5000,
          'top-right',
          false
        )
      );
      expect(screen.queryByText('Password updated successfully.')).not.toBeInTheDocument();
    });
  });
});
