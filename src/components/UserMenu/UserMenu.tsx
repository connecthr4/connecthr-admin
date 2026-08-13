/**
 * The signed-in user's profile chip in the app header. Clicking it opens a
 * popover holding the account actions — currently just "Logout".
 *
 * Kept separate from `AppHeader` so the header itself stays a Server
 * Component: only this chip needs client-side state, and pages like
 * `DepartmentsDashboard` render the header without any client boundary.
 *
 * @example
 * ```tsx
 * import UserMenu from '@src/components/UserMenu';
 *
 * export default function Example() {
 *   return <UserMenu userDetails={user} />;
 * }
 * ```
 */

'use client';

import { useState, useTransition } from 'react';
import clsx from 'clsx';
import { ChevronDown, CircleUserRound, LogOut } from 'lucide-react';
import Popover from '../Popover';
import { Text1, Text2 } from '../Typography';
import { Text3 } from '../Typography/Typography';
import { logoutAction } from '@/src/lib/actions/auth';
import { useAuthStore } from '@/src/store/auth';
import { STRINGS } from '@/src/constants/strings';
import styles from './UserMenu.module.scss';

import type { User } from '@/src/lib/types/auth';

/**
 * Define the props available for the UserMenu component.
 */
interface UserMenuProps {
  /**
   * Authenticated user's information shown on the trigger.
   * If not provided, default placeholder values are rendered.
   */
  userDetails?: User | null;

  /**
   * Additional class name applied to the trigger.
   */
  className?: string;
}

export default function UserMenu({ userDetails, className }: UserMenuProps) {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, startLogout] = useTransition();

  const handleLogout = () => {
    startLogout(async () => {
      /*
      Wiped up front: `logoutAction` ends in a redirect, so it resolves only
      once the router has already navigated — clearing after the await would
      leave the previous user's details readable for that whole round trip.
      The tokens themselves are httpOnly cookies the server drops in
      `clearSession()`; nothing about the session lives in browser storage.
      */
      clearAuth();

      await logoutAction();
    });
  };

  return (
    <Popover
      trigger={
        <button
          type="button"
          className={clsx(styles.trigger, isOpen && styles.triggerOpen, className)}
          aria-label={STRINGS.ACCOUNT_MENU}
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          <CircleUserRound width={48} height={48} className={styles.avatar} />

          {/* A `<button>` only admits phrasing content, so the labels render as spans. */}
          <span className={styles.info}>
            <Text1 as="span" className={styles.name} truncation="ellipsis">
              {userDetails?.name || 'User'}
            </Text1>

            <Text2 as="span" className={styles.role} truncation="ellipsis">
              {userDetails?.role || 'Admin'}
            </Text2>
          </span>

          <ChevronDown className={styles.chevron} />
        </button>
      }
      placement="bottom"
      align="end"
      className={styles.panel}
      onOpenChange={setIsOpen}
    >
      <div role="menu" className={styles.menu}>
        <button
          type="button"
          role="menuitem"
          className={styles.logoutButton}
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut size={18} className={styles.logoutIcon} aria-hidden />
          <Text3 as="span" className={styles.logoutLabel}>
            {STRINGS.LOGOUT}
          </Text3>
        </button>
      </div>
    </Popover>
  );
}
