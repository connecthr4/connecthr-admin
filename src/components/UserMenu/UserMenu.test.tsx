import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import UserMenu from './UserMenu';
import styles from './UserMenu.module.scss';
import { logoutAction } from '@/src/lib/actions/auth';
import { STRINGS } from '@/src/constants/strings';
import type { User } from '@/src/lib/types/auth';

/*
`src/lib/actions/auth` is a Server Action module — it pulls in `server-only`
and `next/headers`, neither of which resolve under jsdom.
*/
vi.mock('@/src/lib/actions/auth', () => ({
  logoutAction: vi.fn(),
}));

const clearAuthMock = vi.fn();

vi.mock('@/src/store/auth', () => ({
  useAuthStore: (selector: (state: { clearAuth: () => void }) => unknown) => selector({ clearAuth: clearAuthMock }),
}));

/*
jsdom has no Popover API, so the panel never enters the top layer and stays
`display: none` — hence `hidden: true` on the queries that reach inside it.
In a browser the same nodes are exposed normally once the panel opens.
*/
const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'SUPER_ADMIN',
  status: 'active',
  mustChangePassword: false,
};

describe('UserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Trigger', () => {
    it('should display the user name and role', () => {
      render(<UserMenu userDetails={mockUser} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Super Admin')).toBeInTheDocument();
    });

    it('should fall back to placeholder details when the user is unknown', () => {
      render(<UserMenu userDetails={null} />);

      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('should render the avatar and chevron icons', () => {
      const { container } = render(<UserMenu userDetails={mockUser} />);

      expect(container.querySelector(`.${styles.avatar}`)).toBeInTheDocument();
      expect(container.querySelector(`.${styles.chevron}`)).toBeInTheDocument();
    });

    it('should be wired to the popover panel', () => {
      render(<UserMenu userDetails={mockUser} />);

      const trigger = screen.getByRole('button', { name: STRINGS.ACCOUNT_MENU });
      const panel = screen.getByRole('menu', { hidden: true }).closest('[popover]') as HTMLElement;

      expect(trigger).toHaveAttribute('popovertarget', panel.id);
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Logout', () => {
    it('should render a logout menu item with the icon before the label', () => {
      const { container } = render(<UserMenu userDetails={mockUser} />);

      const logout = screen.getByRole('menuitem', { name: STRINGS.LOGOUT, hidden: true });
      const icon = container.querySelector(`.${styles.logoutIcon}`);

      expect(logout).toBeInTheDocument();
      expect(icon).toBeInTheDocument();
      expect(logout.firstElementChild).toBe(icon);
    });

    it('should clear the client auth state and call the logout action', async () => {
      const user = userEvent.setup();

      render(<UserMenu userDetails={mockUser} />);

      await user.click(screen.getByRole('menuitem', { name: STRINGS.LOGOUT, hidden: true }));

      await waitFor(() => {
        expect(clearAuthMock).toHaveBeenCalledTimes(1);
        expect(logoutAction).toHaveBeenCalledTimes(1);
      });
    });

    it('should clear the client auth state before awaiting the action', async () => {
      const user = userEvent.setup();
      const callOrder: string[] = [];

      clearAuthMock.mockImplementation(() => callOrder.push('clearAuth'));
      vi.mocked(logoutAction).mockImplementation(async () => {
        callOrder.push('logoutAction');
      });

      render(<UserMenu userDetails={mockUser} />);

      await user.click(screen.getByRole('menuitem', { name: STRINGS.LOGOUT, hidden: true }));

      await waitFor(() => {
        expect(callOrder).toEqual(['clearAuth', 'logoutAction']);
      });
    });
  });
});
