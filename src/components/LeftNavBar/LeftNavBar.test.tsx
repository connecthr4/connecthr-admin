import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LeftNavBar from './LeftNavBar';
import styles from './LeftNavBar.module.scss';
import { NAV_ITEMS } from '@/src/constants/navigation';
import { ROUTES, STRINGS } from '@/src/constants/strings';

const pathnameMock = vi.fn<() => string>(() => ROUTES.DASHBOARD);

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameMock(),
}));

const attendanceGroup = NAV_ITEMS.find((item) => item.href === ROUTES.ATTENDANCE)!;
const userManagementItems = NAV_ITEMS.filter((item) => item.requiresUserManagement);
const alwaysVisibleItems = NAV_ITEMS.filter((item) => !item.requiresUserManagement);

describe('LeftNavBar', () => {
  beforeEach(() => {
    pathnameMock.mockReturnValue(ROUTES.DASHBOARD);
  });

  it('renders the app logo', () => {
    render(<LeftNavBar />);

    expect(screen.getByRole('img', { name: STRINGS.APP_NAME })).toBeInTheDocument();
  });

  it('renders every nav item that does not need user management', () => {
    render(<LeftNavBar />);

    for (const item of alwaysVisibleItems) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it('hides user-management items by default', () => {
    render(<LeftNavBar />);

    for (const item of userManagementItems) {
      expect(screen.queryByText(item.label)).not.toBeInTheDocument();
    }
  });

  it('shows user-management items when showUserManagement is set', () => {
    render(<LeftNavBar showUserManagement />);

    for (const item of userManagementItems) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it('links plain items to their routes', () => {
    render(<LeftNavBar />);

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', ROUTES.DASHBOARD);
    expect(screen.getByRole('link', { name: 'All Employees' })).toHaveAttribute('href', ROUTES.EMPLOYEES);
  });

  it('marks the item for the current route as active', () => {
    pathnameMock.mockReturnValue(ROUTES.EMPLOYEES);
    render(<LeftNavBar />);

    expect(screen.getByRole('link', { name: 'All Employees' })).toHaveClass(styles.active);
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveClass(styles.active);
  });

  it('treats a sub-route as inside its parent item', () => {
    pathnameMock.mockReturnValue(`${ROUTES.EMPLOYEES}/clx-1/edit`);
    render(<LeftNavBar />);

    expect(screen.getByRole('link', { name: 'All Employees' })).toHaveClass(styles.active);
  });

  describe('grouped items', () => {
    it('renders a group as a toggle button, collapsed while the route is outside it', () => {
      render(<LeftNavBar />);

      const toggle = screen.getByRole('button', { name: attendanceGroup.label });
      expect(toggle).toHaveAttribute('aria-expanded', 'false');

      for (const child of attendanceGroup.children!) {
        expect(screen.queryByRole('link', { name: child.label })).not.toBeInTheDocument();
      }
    });

    it('opens the group with its child links when the toggle is clicked', async () => {
      const user = userEvent.setup();
      render(<LeftNavBar />);

      const toggle = screen.getByRole('button', { name: attendanceGroup.label });
      await user.click(toggle);

      expect(toggle).toHaveAttribute('aria-expanded', 'true');

      for (const child of attendanceGroup.children!) {
        expect(screen.getByRole('link', { name: child.label })).toHaveAttribute('href', child.href);
      }
    });

    it('closes the group again on a second click', async () => {
      const user = userEvent.setup();
      render(<LeftNavBar />);

      const toggle = screen.getByRole('button', { name: attendanceGroup.label });
      await user.click(toggle);
      await user.click(toggle);

      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('link', { name: attendanceGroup.children![0].label })).not.toBeInTheDocument();
    });

    it('arrives expanded and active when the current route is inside the group', () => {
      pathnameMock.mockReturnValue(ROUTES.MARK_ATTENDANCE);
      render(<LeftNavBar />);

      const toggle = screen.getByRole('button', { name: attendanceGroup.label });
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(toggle).toHaveClass(styles.active);
    });

    it('highlights only the child matching the current route', () => {
      pathnameMock.mockReturnValue(ROUTES.ATTENDANCE_LIST);
      render(<LeftNavBar />);

      expect(screen.getByRole('link', { name: 'Attendance List' })).toHaveClass(styles.submenuItemActive);
      expect(screen.getByRole('link', { name: 'Mark Attendance' })).not.toHaveClass(styles.submenuItemActive);
    });

    it('lets the user collapse a group even while the route is inside it', async () => {
      const user = userEvent.setup();
      pathnameMock.mockReturnValue(ROUTES.MARK_ATTENDANCE);
      render(<LeftNavBar />);

      const toggle = screen.getByRole('button', { name: attendanceGroup.label });
      await user.click(toggle);

      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('link', { name: 'Mark Attendance' })).not.toBeInTheDocument();
    });

    it('points the toggle at its submenu via aria-controls', async () => {
      const user = userEvent.setup();
      render(<LeftNavBar />);

      const toggle = screen.getByRole('button', { name: attendanceGroup.label });
      await user.click(toggle);

      const submenuId = toggle.getAttribute('aria-controls');
      expect(submenuId).toBeTruthy();
      expect(document.getElementById(submenuId!)).toContainElement(
        screen.getByRole('link', { name: 'Mark Attendance' })
      );
    });
  });
});
