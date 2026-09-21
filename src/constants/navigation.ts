import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  CalendarCheck,
  ClipboardList,
  Wallet,
  Briefcase,
  UserRound,
  FileText,
  CalendarDays,
  Settings,
  UserPlus,
  UserCog,
} from 'lucide-react';

import { ROUTES } from './strings';

import type { LucideIcon } from 'lucide-react';

/**
 * A second-level entry inside a nav group. The icon is optional: the sub-items
 * are already indented under the group, so an icon only earns its place when it
 * tells the sub-items apart — a group whose labels do that on their own reads
 * fine without one. Give every sub-item in a group an icon or none of them: a
 * mix leaves the labels without one sitting a column to the left of the rest.
 */
export interface NavSubItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;

  /**
   * Turns the item into an expandable group. The group header stops being a
   * link — `href` is kept as the segment the group owns, which is what decides
   * whether the group renders as active and opens itself on a page load inside
   * it. Only the sub-items navigate, so no group header points at a route that
   * has no page of its own.
   */
  children?: NavSubItem[];

  /**
   * Marks an item that only a role above Admin may reach. Filtered out of the
   * rendered nav for everyone else — a courtesy so nobody clicks a button that
   * would fail, not the access control. The routes themselves are guarded
   * server-side, and the backend guards them again.
   */
  requiresUserManagement?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'All Employees',
    href: '/employees',
    icon: Users,
  },
  // {
  //   label: 'All Departments',
  //   href: '/departments',
  //   icon: Building2,
  // },
  {
    label: 'Attendance',
    href: ROUTES.ATTENDANCE,
    icon: Calendar,
    children: [
      {
        label: 'Mark Attendance',
        href: ROUTES.MARK_ATTENDANCE,
      },
      {
        label: 'Attendance List',
        href: ROUTES.ATTENDANCE_LIST,
      },
    ],
  },
  // {
  //   label: 'Payroll',
  //   href: '/payroll',
  //   icon: Wallet,
  // },
  // {
  //   label: 'Jobs',
  //   href: '/jobs',
  //   icon: Briefcase,
  // },
  // {
  //   label: 'Candidates',
  //   href: '/candidates',
  //   icon: UserRound,
  // },
  // {
  //   label: 'Leaves',
  //   href: '/leaves',
  //   icon: FileText,
  // },
  {
    label: 'Holidays',
    href: '/holidays',
    icon: CalendarDays,
  },
  {
    label: 'Users',
    href: '/users',
    icon: UserCog,
    requiresUserManagement: true,
  },
  {
    label: 'Create User',
    href: '/create-user',
    icon: UserPlus,
    requiresUserManagement: true,
  },
  // {
  //   label: 'Settings',
  //   href: '/settings',
  //   icon: Settings,
  // },
];
