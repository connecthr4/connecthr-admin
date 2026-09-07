/**
 * LeftNavBar is a reusable sidebar navigation component used to provide quick access to dashboard modules and application routes.
 *
 * @example
 * ```tsx
 * import LeftNavBar from '@src/components/LeftNavBar'
 *
 * export default function LeftNavBar() {
 *   return <LeftNavBar label="Hello" />;
 * }
 * ```
 */

'use client';

import { useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';
import AppImage from '../AppImage';
import AppLink from '../AppLink';
import { usePathname } from 'next/navigation';
import { STRINGS } from '@/src/constants/strings';
import { NAV_ITEMS } from '@/src/constants/navigation';
import { NavLabel } from '../Typography/Typography';
import styles from './LeftNavBar.module.scss';

import type { NavItem } from '@/src/constants/navigation';

/**
 * Define the props available for the LeftNavBar component.
 */
interface LeftNavBarProps {
  /**
   * Whether to render the items gated behind user management. Resolved on the
   * server from the signed-in user's role and passed in, rather than read from
   * the client store — the store is empty on a fresh page load, which would
   * blink the items out of existence for anyone entitled to see them.
   *
   * Defaults to `false` so an unresolved role hides the items rather than
   * offering an action that would fail.
   */
  showUserManagement?: boolean;
}

/**
 * Whether `pathname` is the given route or somewhere inside it. The suffixed
 * comparison is what keeps `/users` from lighting up on `/users-archive`.
 */
function isCurrentRoute(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function LeftNavBar({ showUserManagement = false }: LeftNavBarProps) {
  const pathname = usePathname();

  const navItems = useMemo(
    () => NAV_ITEMS.filter((item) => !item.requiresUserManagement || showUserManagement),
    [showUserManagement]
  );

  /*
  Only the groups the user has opened or closed by hand, keyed by group href. A
  group that isn't in here falls back to "open when the current route is inside
  it", so a page load on a sub-route arrives with its group already expanded and
  navigating between two sub-routes never collapses it.
  */
  const [toggledGroups, setToggledGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = useCallback((href: string, isExpanded: boolean) => {
    setToggledGroups((previous) => ({ ...previous, [href]: !isExpanded }));
  }, []);

  const renderGroup = (item: NavItem & { children: NonNullable<NavItem['children']> }) => {
    const Icon = item.icon;
    const isActive = isCurrentRoute(pathname, item.href);
    const isExpanded = toggledGroups[item.href] ?? isActive;
    const submenuId = `nav-submenu-${item.href.replace(/\W+/g, '-')}`;

    return (
      <div key={item.href} className={styles.group}>
        <button
          type="button"
          className={clsx(styles.navItem, styles.groupToggle, {
            [styles.active]: isActive,
          })}
          aria-expanded={isExpanded}
          aria-controls={submenuId}
          onClick={() => toggleGroup(item.href, isExpanded)}
        >
          <span className={styles.icon}>
            <Icon size={22} />
          </span>

          <NavLabel>{item.label}</NavLabel>
        </button>

        {/*
        Unmounted rather than hidden while collapsed: the sub-links would
        otherwise stay in the tab order and be prefetched behind a group the
        user has closed.
        */}
        {isExpanded && (
          <div id={submenuId} className={styles.submenu}>
            {item.children.map((child) => {
              const ChildIcon = child.icon;
              return (
                <AppLink
                  key={child.href}
                  href={child.href}
                  className={clsx(styles.submenuItem, {
                    [styles.submenuItemActive]: isCurrentRoute(pathname, child.href),
                  })}
                >
                  {ChildIcon && (
                    <span className={styles.icon}>
                      <ChildIcon size={18} />
                    </span>
                  )}

                  <NavLabel>{child.label}</NavLabel>
                </AppLink>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoSection}>
        <AppImage
          src="/zentrohr-logo.svg"
          alt={STRINGS.APP_NAME}
          width={931}
          height={202}
          className={styles.logo}
          preload
        />
      </div>

      <nav className={styles.navigation}>
        {navItems.map((item) => {
          if (item.children?.length) {
            return renderGroup({ ...item, children: item.children });
          }

          const isActive = isCurrentRoute(pathname, item.href);
          const Icon = item.icon;
          return (
            <AppLink
              key={item.href}
              href={item.href}
              className={clsx(styles.navItem, {
                [styles.active]: isActive,
              })}
            >
              <span className={styles.icon}>
                <Icon size={22} />
              </span>

              <NavLabel>{item.label}</NavLabel>
            </AppLink>
          );
        })}
      </nav>
    </aside>
  );
}
