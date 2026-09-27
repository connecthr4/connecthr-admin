import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import LeftNavBar from './LeftNavBar';
import styles from './LeftNavBar.module.scss';
import { NAV_ITEMS } from '@/src/constants/navigation';
import { ROUTES, STRINGS } from '@/src/constants/strings';
import { useLayoutStore } from '@/src/store/layout';

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

  describe('tablet drawer', () => {
    /*
    jsdom has no `matchMedia`; the drawer consults it while open to close itself once
    the sidebar docks. `matches` is what the test controls, `change` fires the listener.
    */
    let dockedListener: (() => void) | undefined;
    const mediaQuery = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };

    beforeEach(() => {
      mediaQuery.matches = false;
      mediaQuery.addEventListener.mockImplementation((_: string, listener: () => void) => {
        dockedListener = listener;
      });
      vi.stubGlobal('matchMedia', () => mediaQuery);
      useLayoutStore.setState({ isNavOpen: false });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    const openDrawer = () => act(() => useLayoutStore.getState().openNav());
    const getDrawer = () => screen.getByRole('dialog', { name: STRINGS.NAVIGATION_MENU });

    it('keeps the drawer empty while it is closed, so its links are not duplicated', () => {
      render(<LeftNavBar />);

      expect(screen.getAllByRole('link', { name: 'Dashboard' })).toHaveLength(1);
    });

    it('shows the nav in the drawer once opened', () => {
      render(<LeftNavBar />);
      openDrawer();

      expect(within(getDrawer()).getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', ROUTES.DASHBOARD);
    });

    it('gives the drawer copy of a group its own submenu id', async () => {
      const user = userEvent.setup();
      pathnameMock.mockReturnValue(ROUTES.MARK_ATTENDANCE);
      render(<LeftNavBar />);
      openDrawer();

      const drawerToggle = within(getDrawer()).getByRole('button', { name: attendanceGroup.label });
      const dockedToggle = screen
        .getAllByRole('button', { name: attendanceGroup.label })
        .find((toggle) => toggle !== drawerToggle)!;

      expect(drawerToggle.getAttribute('aria-controls')).not.toBe(dockedToggle.getAttribute('aria-controls'));

      await user.click(drawerToggle);
      expect(drawerToggle).toHaveAttribute('aria-expanded', 'false');
    });

    it('closes when a link inside it is followed', async () => {
      const user = userEvent.setup();
      render(<LeftNavBar />);
      openDrawer();

      await user.click(within(getDrawer()).getByRole('link', { name: 'Dashboard' }));

      expect(useLayoutStore.getState().isNavOpen).toBe(false);
    });

    it('closes from its close button', async () => {
      const user = userEvent.setup();
      render(<LeftNavBar />);
      openDrawer();

      await user.click(within(getDrawer()).getByRole('button', { name: STRINGS.CLOSE_NAVIGATION_MENU }));

      expect(useLayoutStore.getState().isNavOpen).toBe(false);
    });

    it('closes when the route changes', () => {
      const { rerender } = render(<LeftNavBar />);
      openDrawer();

      pathnameMock.mockReturnValue(ROUTES.EMPLOYEES);
      rerender(<LeftNavBar />);

      expect(useLayoutStore.getState().isNavOpen).toBe(false);
    });

    it('closes when the viewport widens enough to dock the sidebar', () => {
      render(<LeftNavBar />);
      openDrawer();
      expect(useLayoutStore.getState().isNavOpen).toBe(true);

      mediaQuery.matches = true;
      act(() => dockedListener?.());

      expect(useLayoutStore.getState().isNavOpen).toBe(false);
    });
  });
});
