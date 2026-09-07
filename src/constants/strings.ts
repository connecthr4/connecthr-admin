import { User, BriefcaseBusiness, FileText, Wallet, UserRound } from 'lucide-react';
import { NotificationType } from '../providers/NotificationProvider';
import type { EmployeeDocumentType } from '../store/employeeStore/types';

export const STRINGS = {
  APP_NAME: 'ZentroHR',
  YEAR: 'Year - 2026',
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
  PASSWORD_RESET_FAILED: 'Password Reset Failed',
  NEW_PASSWORD_REQUIRED: 'New password is required',
  NEW_PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters long',
  CONFIRM_PASSWORD_REQUIRED: 'Confirm password is required',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  NEW_PASSWORD: 'New Password',
  ENTER_NEW_PASSWORD: 'Enter new password',
  CONFIRM_PASSWORD: 'Confirm Password',
  CONFIRM_NEW_PASSWORD: 'Confirm new password',
  RESET_PASSWORD: 'Reset Password',
  PLEASE_CREATE_NEW_PASSWORD: 'Please create a new password.',
  PASSWORD_UPDATED_SUCCESSFULLY: 'Password updated successfully.',
  BACK_TO_LOGIN: 'Back to Login',
  PASSWORD_REQUIREMENT_MIN_LENGTH: 'At least 8 characters',
  PASSWORD_REQUIREMENT_UPPERCASE: 'One uppercase letter',
  PASSWORD_REQUIREMENT_LOWERCASE: 'One lowercase letter',
  PASSWORD_REQUIREMENT_NUMBER: 'One number',
  PASSWORD_REQUIREMENT_SPECIAL_CHARACTER: 'One special character',
  HOLIDAY_CREATION_FAILED: 'Holiday creation failed',
  HOLIDAY_CREATED_SUCCESSFULLY: 'Holiday created successfully',
  HOLIDAY_DELETION_FAILED: 'Holiday deletion failed',
  HOLIDAY_DELETED_SUCCESSFULLY: 'Holiday deleted successfully',
  ADD_NEW_HOLIDAY: 'Add New Holiday',
  HOLIDAYS: 'Holidays',
  ALL_HOLIDAY_LISTS: 'All Holiday Lists',
  HOLIDAY_NAME_IS_REQUIRED: 'Holiday name is required',
  HOLIDAY_DATE_IS_REQUIRED: 'Holiday date is required',
  HOLIDAY_NAME: 'Holiday Name',
  HOLIDAY_NAME_PLACEHOLDER: 'Enter Holiday Name',
  SELECT_DATE: 'Select Date',
  CANCEL: 'Cancel',
  ADD: 'Add',
  EXPORT: 'Export',
  DOWNLOAD: 'Download',
  EXPORT_HOLIDAYS_CONFIRMATION: 'The holiday list will be downloaded as an Excel file. Do you want to continue?',
  HOLIDAYS_EXPORTED_SUCCESSFULLY: 'Holidays exported successfully',
  HOLIDAYS_EXPORT_FAILED: 'Holidays export failed',
  EXPORT_EMPLOYEES_CONFIRMATION: 'The employee list will be downloaded as an Excel file. Choose what to include:',
  EXPORT_SCOPE_LABEL: 'What to export',
  EXPORT_SCOPE_ALL: 'All records',
  EXPORT_SCOPE_FILTERED: 'Only the list currently shown',
  EXPORT_SCOPE_ALL_EMPLOYEES: 'All employees',
  EMPLOYEES_EXPORTED_SUCCESSFULLY: 'Employees exported successfully',
  EMPLOYEES_EXPORT_FAILED: 'Employees export failed',
  NO_HOLIDAYS_ADDED: 'No holidays added yet',
  NO_DATA_FOUND: 'No data found',
  SHOWING: 'Showing',
  EMPLOYEES_FETCH_FAILED: 'Failed to load employees',
  FILTER: 'Filter',
  APPLY_FILTER: 'Apply Filter',
  CLEAR: 'Clear',
  ALL_EMPLOYEES: 'All Employees',
  ALL_EMPLOYEE_INFORMATION: 'All Employee Information',
  ADD_NEW_EMPLOYEE: 'Add New Employee',
  EDIT_EMPLOYEE: 'Edit Employee',
  SEARCH_EMPLOYEE: 'Search employee...',
  CREATE_EMPLOYEE: 'Create Employee',
  UPDATE_EMPLOYEE: 'Update Employee',
  EMPLOYEE_CREATED_SUCCESSFULLY: 'Employee created successfully',
  EMPLOYEE_CREATION_FAILED: 'Employee creation failed',
  EMPLOYEE_UPDATE_FAILED: 'Employee update failed',
  NO_CHANGES_TO_UPDATE: 'No changes to update',
  NOTHING_WAS_CHANGED: 'Edit a field before saving, or go back to the employee.',
  EMPLOYEE_NAME: 'Employee Name',
  EMPLOYEE_ID: 'Employee ID',
  DEPARTMENT: 'Department',
  DESIGNATION: 'Designation',
  EMPLOYEE_TYPE: 'Employee Type',
  EMPLOYMENT_STATUS: 'Employment Status',
  BACK_TO_ALL_EMPLOYEES: 'Back to All Employees',
  EMPLOYEE_FETCH_FAILED: 'Failed to load employee',
  EDIT_PROFILE: 'Edit Profile',
  PROFILE: 'Profile',
  SEPARATION: 'Separation',
  NO_DOCUMENTS_UPLOADED: 'No documents uploaded yet',
  NOT_AVAILABLE: '--',
  TOTAL_EMPLOYEE: 'Total Employee',
  TODAY_ATTENDANCE: 'Today Attendance',
  TODAY_ON_LEAVE: 'Today On Leave',
  DEPARTMENT_DISTRIBUTION: 'Department Distribution',
  EMPLOYEES: 'Employees',
  NO_UPCOMING_HOLIDAYS: 'No upcoming holidays',
  LOGOUT: 'Logout',
  SESSION_EXPIRED: 'Your session has expired due to inactivity. Please log in again.',
  /*
  For a session that ended without the idle timeout being the known cause — a revoked token,
  or a backend `/auth/me` that could not be reached. Blaming those on inactivity would be a
  guess, and during an outage it would be the same wrong guess for every user at once.
  */
  SESSION_ENDED: 'Please log in again to continue.',
  ACCOUNT_MENU: 'Account menu',
  CREATE_USER: 'Create User',
  ADD_NEW_USER: 'Add New User',
  USERS: 'Users',
  ALL_USER_ACCOUNTS: 'All user accounts',
  USER_NAME: 'Name',
  USER_EMAIL: 'Email',
  USER_ROLE: 'Role',
  USER_STATUS: 'Status',
  USER_LAST_LOGIN: 'Last Login',
  USER_CREATED_BY: 'Created By',
  NEVER: 'Never',
  USERS_FETCH_FAILED: 'Failed to load users',
  FULL_NAME: 'Full Name',
  FULL_NAME_PLACEHOLDER: 'Enter full name',
  NAME_REQUIRED: 'Name is required',
  ROLE_REQUIRED: 'Role is required',
  SELECT_ROLE: 'Select a role',
  ROLES_FETCH_FAILED: 'Failed to load assignable roles',
  NO_ASSIGNABLE_ROLES: 'Your account cannot assign any roles.',
  USER_CREATED_SUCCESSFULLY: 'User created successfully',
  USER_CREATION_FAILED: 'User creation failed',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
  TEMPORARY_PASSWORD: 'Temporary Password',
  TEMPORARY_PASSWORD_WARNING:
    'This password is shown once and cannot be retrieved again. Copy it now and share it with the user securely.',
  COPY: 'Copy',
  COPIED: 'Copied',
  COPY_FAILED: 'Could not copy — select the password and copy it manually.',
  CREATE_ANOTHER_USER: 'Create Another User',
  BACK_TO_USERS: 'Back to Users',
  CREATE: 'Create',
  UPLOAD_APPOINTMENT_LETTER: 'Upload Appointment Letter',
  UPLOAD_SALARY_SLIPS: 'Upload Salary Slips',
  UPLOAD_RELIEVING_LETTER: 'Upload Relieving Letter',
  UPLOAD_EXPERIENCE_LETTER: 'Upload Experience Letter',

  /*
  The three halves of the dropzone's one sentence — "choose file" is rendered as the link in
  the middle of it, so it has to be its own string.
  */
  DRAG_AND_DROP: 'Drag & Drop or',
  CHOOSE_FILE: 'choose file',
  TO_UPLOAD: 'to upload',
  SUPPORTED_FORMATS: 'Supported formats : Jpeg, pdf',

  /** Which formats those are is already on screen, right under this message. */
  UNSUPPORTED_FILE_TYPE: 'That file type is not supported.',

  /** The dropzone appends its own limit ("...is 5MB."), since that is a prop it can be given. */
  FILE_TOO_LARGE: 'File is too large. The maximum size is',
  REMOVE: 'Remove',
  REPLACE_FILE: 'Replace file',
  ATTENDANCE: 'Attendance',
  MARK_ATTENDANCE: 'Mark Attendance',
  MARK_ATTENDANCE_SUBTITLE: 'Mark attendance for your employees',
  ATTENDANCE_LIST: 'Attendance List',
  ATTENDANCE_LIST_SUBTITLE: 'Daily attendance and overtime records',
  DATE: 'Date',
  ALL_DEPARTMENTS: 'All Departments',
  ALL_SHIFTS: 'All Shifts',
  VIEW: 'View',
  RESET: 'Reset',
  TOTAL_EMPLOYEES: 'Total Employees',
  PRESENT: 'Present',
  ABSENT: 'Absent',
  HALF_DAY: 'Half Day',
  ON_LEAVE: 'On Leave',

  /**
   * A half day is marked as one of two statuses rather than "Half Day" plus a
   * separate which-half column, so the row carries a single value.
   */
  HALF_DAY_FIRST_HALF: 'Half Day (First Half)',
  HALF_DAY_SECOND_HALF: 'Half Day (Second Half)',
  SHIFT: 'Shift',
  ATTENDANCE_STATUS: 'Attendance Status',
  OVERTIME: 'Overtime',
  REMARKS: 'Remarks',
  SELECT_STATUS: 'Select status',
  ADD_REMARKS: 'Add remarks...',
  SEARCH_EMPLOYEE_NAME_OR_ID: 'Search by employee name or ID...',
  OVERTIME_HOURS_PLACEHOLDER: 'HH',
  OVERTIME_MINUTES_PLACEHOLDER: 'MM',
  SAVE_AS_DRAFT: 'Save as Draft',
  SUBMIT_ATTENDANCE: 'Submit Attendance',
  ATTENDANCE_DRAFT_SAVED: 'Draft saved',
  ATTENDANCE_DRAFT_SAVE_FAILED: 'Draft could not be saved',
  ATTENDANCE_NOTHING_TO_MARK: 'Nothing has been marked yet',
  ATTENDANCE_INCOMPLETE: 'Some employees are not marked yet',

  /** The count it is missing is prefixed by the caller: "3 of 28 ...". */
  ATTENDANCE_UNMARKED_MESSAGE: 'employees are still unmarked. Mark them, or save what you have as a draft.',
  ATTENDANCE_EXPORTED_SUCCESSFULLY: 'Attendance sheet exported successfully',
  ATTENDANCE_FETCH_FAILED: 'Failed to load the attendance sheet',

  /**
   * The heading a submission is reported under. The detail beneath it is the
   * backend's own message, so what the user reads is what was actually
   * recorded — these only say which way it went.
   */
  ATTENDANCE_SUBMITTED: 'Attendance submitted',
  ATTENDANCE_SUBMIT_FAILED: 'Attendance could not be submitted',

  /** Stands in until the attendance endpoints exist for these two screens to read. */
  ATTENDANCE_COMING_SOON: 'This screen is being built. Attendance records will appear here.',
};

/**
 * The upload rules the documents step enforces, in one place: they are both what the file
 * input offers and what a dropped file is checked against.
 */
export const DOCUMENT_UPLOAD = {
  /** MIME types, so they can be handed to `accept` and compared against `File.type`. */
  ACCEPTED_TYPES: ['image/jpeg', 'application/pdf'],
  MAX_SIZE_MB: 5,
} as const;

/**
 * The documents step's four upload fields, in the order they are laid out. Keyed by the
 * store slot each one fills, so the step is a single `map` over this.
 */
export const DOCUMENT_FIELDS: readonly { id: EmployeeDocumentType; label: string }[] = [
  { id: 'appointmentLetter', label: STRINGS.UPLOAD_APPOINTMENT_LETTER },
  { id: 'salarySlips', label: STRINGS.UPLOAD_SALARY_SLIPS },
  { id: 'relievingLetter', label: STRINGS.UPLOAD_RELIEVING_LETTER },
  { id: 'experienceLetter', label: STRINGS.UPLOAD_EXPERIENCE_LETTER },
];

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

/**
 * The employee details screen's sidebar menu. Lives here rather than in the screen itself
 * because its loading skeleton draws the same menu, and that skeleton renders on the server
 * — where a `'use client'` module's exports can only be rendered, never read.
 */
export const PROFILE_ITEMS = [
  {
    label: STRINGS.PROFILE,
    icon: UserRound,
  },
] as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  EMPLOYEES: '/employees',

  /**
   * The attendance segment itself has no screen — it is the group the two
   * routes below sit in, and what the sidebar matches the current path against
   * to decide the group is the one open. Visiting it lands on Mark Attendance.
   */
  ATTENDANCE: '/attendance',
  MARK_ATTENDANCE: '/attendance/mark-attendance',
  ATTENDANCE_LIST: '/attendance/attendance-list',
  HOLIDAYS: '/holidays',
  USERS: '/users',
  CREATE_USER: '/create-user',
} as const;

/**
 * Marks a login redirect issued by a server render that found the session
 * unusable, and says which of the two reasons below sent the user back.
 *
 * `proxy.ts` gates only on the presence of the access-token cookie,
 * which such a render cannot always clear — cookies are only writable from a
 * Server Action or Route Handler, not mid-render. Without this marker the
 * proxy would see the stale cookie, bounce the request back to the dashboard,
 * and the two would redirect at each other indefinitely.
 */
export const SESSION_END_QUERY = {
  KEY: 'session',

  /** The idle timeout ran out: the user really was signed out for being away. */
  IDLE: 'expired',

  /**
   * The session could not be used, for a reason nothing on the server can pin on inactivity.
   * Carries the marker — and so the loop guard — but a wording that does not accuse.
   */
  ENDED: 'ended',
} as const;

export type SessionEndReason = (typeof SESSION_END_QUERY)['IDLE' | 'ENDED'];

export const LOGIN_SESSION_EXPIRED_URL = `${ROUTES.LOGIN}?${SESSION_END_QUERY.KEY}=${SESSION_END_QUERY.IDLE}`;

export const LOGIN_SESSION_ENDED_URL = `${ROUTES.LOGIN}?${SESSION_END_QUERY.KEY}=${SESSION_END_QUERY.ENDED}`;

/**
 * How a Route Handler tells the browser that the 401 it just returned was an
 * idle timeout rather than an ordinary authorization failure — the first calls
 * for a trip to the login screen, the second for an error message in place.
 */
export const SESSION_EXPIRED_CODE = 'SESSION_EXPIRED';

export const NOTIFICATION_TYPES: Record<string, NotificationType> = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};
