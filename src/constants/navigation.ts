import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  Wallet,
  Briefcase,
  UserRound,
  FileText,
  CalendarDays,
  Settings,
  UserPlus,
  UserCog,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;

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
  {
    label: 'All Departments',
    href: '/departments',
    icon: Building2,
  },
  // {
  //   label: 'Attendance',
  //   href: '/attendance',
  //   icon: Calendar,
  // },
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
