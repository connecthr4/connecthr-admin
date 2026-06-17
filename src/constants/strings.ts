import { User, BriefcaseBusiness, FileText, Wallet } from 'lucide-react';

export const STRINGS = {
  APP_NAME: 'connectHR',
  UPCOMING_HOLIDAYS: 'Upcoming Holidays',
  VIEW_ALL: 'View all',
};

export const STEPS = [
  {
    id: 'personal-information',
    label: 'Personal Information',
    icon: User,
  },
  {
    id: 'professional-information',
    label: 'Professional Information',
    icon: BriefcaseBusiness,
  },
  {
    id: 'payroll-information',
    label: 'Payroll Information',
    icon: Wallet,
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
  },
] as const;
