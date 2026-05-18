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
} from 'lucide-react';

export const NAV_ITEMS = [
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
  {
    label: 'Attendance',
    href: '/attendance',
    icon: Calendar,
  },
  {
    label: 'Payroll',
    href: '/payroll',
    icon: Wallet,
  },
  {
    label: 'Jobs',
    href: '/jobs',
    icon: Briefcase,
  },
  {
    label: 'Candidates',
    href: '/candidates',
    icon: UserRound,
  },
  {
    label: 'Leaves',
    href: '/leaves',
    icon: FileText,
  },
  {
    label: 'Holidays',
    href: '/holidays',
    icon: CalendarDays,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];
