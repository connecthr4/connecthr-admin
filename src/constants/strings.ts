import { User, BriefcaseBusiness, FileText, Wallet } from 'lucide-react';
import { NotificationType } from '../providers/NotificationProvider';

export const STRINGS = {
  APP_NAME: 'connectHR',
  UPCOMING_HOLIDAYS: 'Upcoming Holidays',
  VIEW_ALL: 'View all',
  EMAIL_ADDRESS: 'Email Address',
  EMAIL_ADDRESS_PLACEHOLDER: 'Enter email address',
  PASSWORD: 'Password',
  PASSWORD_PLACEHOLDER: 'Enter password',
  LOGIN: 'Login',
  PASSWORD_REQUIRED: 'Password is required',
  EMAIL_REQUIRED: 'Email address is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  LOGIN_FAILED: 'Login Failed',
  WELCOME: 'Welcome',
  PLEASE_LOGIN_HERE: 'Please login here',
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

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
} as const;

export const NOTIFICATION_TYPES: Record<string, NotificationType> = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};
