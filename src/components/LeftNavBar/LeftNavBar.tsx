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

import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react';
import clsx from 'clsx';
import AppImage from '../AppImage';
import AppLink from '../AppLink';
import Drawer from '../Drawer';
import { usePathname } from 'next/navigation';
import { STRINGS } from '@/src/constants/strings';
import { NAV_ITEMS } from '@/src/constants/navigation';
import { DOCKED_NAV_QUERY } from '@/src/constants/breakpoints';
import { useLayoutStore } from '@/src/store/layout';
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

  const isNavOpen = useLayoutStore((state) => state.isNavOpen);
  const closeNav = useLayoutStore((state) => state.closeNav);

  /*
  The drawer closes whenever the route changes — a link inside it, but also the
  browser's back button, which would otherwise leave it open over the new page.
  */
  useEffect(() => {
    closeNav();
  }, [pathname, closeNav]);

  /*
  And when the viewport widens past `md` while it is open — rotating a tablet to
  a wide landscape, or resizing a window — since the docked sidebar takes over
  there and a modal drawer would be left covering the page for no reason.
  */
  useEffect(() => {
    if (!isNavOpen) return;

    const dockedQuery = window.matchMedia(DOCKED_NAV_QUERY);
    const closeWhenDocked = () => {
      if (dockedQuery.matches) closeNav();
    };

    closeWhenDocked();
    dockedQuery.addEventListener('change', closeWhenDocked);

    return () => dockedQuery.removeEventListener('change', closeWhenDocked);
  }, [isNavOpen, closeNav]);

  /*
  A link to the page already on screen changes no route, so the effect above
  never sees it. One delegated handler covers every link in the drawer.
  */
  const handleDrawerNavClick = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as Element).closest('a')) closeNav();
  };

  /*
  `idPrefix` keeps the submenu ids unique: the docked sidebar stays in the DOM
  (hidden by CSS) while the drawer is open, so both copies exist at once.
  */
  const renderGroup = (item: NavItem & { children: NonNullable<NavItem['children']> }, idPrefix: string) => {
    const Icon = item.icon;
    const isActive = isCurrentRoute(pathname, item.href);
    const isExpanded = toggledGroups[item.href] ?? isActive;
    const submenuId = `${idPrefix}-submenu-${item.href.replace(/\W+/g, '-')}`;

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

  const renderNav = (idPrefix: string, onClick?: (event: MouseEvent<HTMLElement>) => void) => (
    <>
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

      <nav className={styles.navigation} onClick={onClick}>
        {navItems.map((item) => {
          if (item.children?.length) {
            return renderGroup({ ...item, children: item.children }, idPrefix);
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
    </>
  );

  /*
  Both are always rendered and CSS decides which one the viewport gets, so the
  docked sidebar is in the server HTML and never waits on script to appear. The
  drawer only mounts its content while open, so its links are not duplicated in
  the tab order or prefetched while it is shut.
  */
  return (
    <>
      <aside className={styles.sidebar}>{renderNav('nav')}</aside>

      <Drawer
        isOpen={isNavOpen}
        onClose={closeNav}
        placement="left"
        size="17.5rem"
        ariaLabel={STRINGS.NAVIGATION_MENU}
        closeButtonLabel={STRINGS.CLOSE_NAVIGATION_MENU}
        className={styles.drawer}
        bodyClassName={styles.drawerBody}
      >
        {renderNav('nav-drawer', handleDrawerNavClick)}
      </Drawer>
    </>
  );
}
