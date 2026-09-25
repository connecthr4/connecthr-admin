import { User, BriefcaseBusiness, CalendarCheck, FileText, Wallet, UserRound, UserRoundMinus } from 'lucide-react';
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
  USER_ACTIONS: 'Actions',
  NEVER: 'Never',
  USERS_FETCH_FAILED: 'Failed to load users',
  /** Also the verb the row action puts in front of a name: "Delete Priya Nair". */
  DELETE: 'Delete',
  DELETE_USER: 'Delete User',

  /*
  Says the two things a reader cannot get back by trying it: that there is no
  undo, and that deleting the account does not delete what it did. Both belong
  in front of the confirm button rather than in a message after it.
  */
  DELETE_USER_CONFIRMATION:
    'This account will be permanently deleted and cannot be restored. Attendance they marked and separations they raised or decided are kept, shown against an unknown user.',
  USER_DELETED_SUCCESSFULLY: 'User deleted successfully',
  USER_DELETION_FAILED: 'User deletion failed',
  USER_DELETION_NOT_PERMITTED: 'Your account cannot delete users.',
  CANNOT_DELETE_OWN_ACCOUNT: 'You cannot delete your own account.',
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
  ALL_STATUS: 'All Status',
  STATUS: 'Status',
  VIEW: 'View',
  APPLY: 'Apply',
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
  ATTENDANCE_UNMARKED_MESSAGE: 'employees are still unmarked. Mark them, or save what you have as a draft.',
  ATTENDANCE_EXPORTED_SUCCESSFULLY: 'Attendance sheet exported successfully',
  ATTENDANCE_EXPORT_FAILED: 'Attendance export failed',
  EXPORT_ATTENDANCE_CONFIRMATION: 'The attendance list will be downloaded as an Excel file. Choose what to include:',
  EXPORT_SCOPE_ALL_ATTENDANCE: 'All employees for the selected date',
  ATTENDANCE_FETCH_FAILED: 'Failed to load the attendance sheet',
  ATTENDANCE_SUBMITTED: 'Attendance submitted',
  ATTENDANCE_SUBMIT_FAILED: 'Attendance could not be submitted',
  SL_NO: 'Sl No',
  EMPLOYEE_ATTENDANCE_FETCH_FAILED: "Failed to load this employee's attendance",
  NO_ATTENDANCE_RECORDS: 'No attendance has been recorded for this employee yet',
  TRY_AGAIN: 'Try again',
  INITIATE_SEPARATION: 'Initiate Separation',
  SEPARATION_DETAILS: 'Separation Details',
  SEPARATION_TYPE: 'Separation Type',
  SELECT_SEPARATION_TYPE: 'Select Separation Type',
  RESIGNATION_DATE: 'Resignation Date',
  NOTICE_PERIOD_DAYS_LABEL: 'Notice Period (Days)',
  NOTICE_PERIOD_PLACEHOLDER: 'Enter the notice period in days',
  LAST_WORKING_DATE: 'Last Working Date',
  REASON_FOR_LEAVING: 'Reason for Leaving',
  REASON_FOR_LEAVING_PLACEHOLDER: 'Why is the employee leaving?',
  ADDITIONAL_NOTES: 'Additional Notes (Optional)',
  ADDITIONAL_NOTES_PLACEHOLDER: 'Anything else the HR team should know',
  UPLOAD_RESIGNATION_LETTER: 'Resignation Letter',
  DATE_OF_JOINING: 'Date of Joining',
  SEPARATION_INITIATED: 'Separation initiated',
  SEPARATION_FAILED: 'Separation could not be submitted',
  SEPARATIONS: 'Separations',
  ALL_SEPARATION_REQUESTS: 'All separation requests',
  RESIGNATION_TYPE: 'Resignation Type',
  CURRENT_STATUS: 'Current Status',
  ACTION: 'Action',
  VIEW_SEPARATION_DETAILS: 'View separation details',
  NO_SEPARATIONS_FOUND: 'No separation requests have been filed yet',
  NOTICE_PERIOD: 'Notice Period',

  /** The read-only panel's label for the same field the form calls "(Optional)". */
  ADDITIONAL_NOTES_LABEL: 'Additional Notes',

  /** The API's `raisedAt` — separations are filed by an admin, not by the employee. */
  RAISED_ON: 'Raised On',
  RAISED_BY: 'Raised By',

  /** Appended to the notice period, which is stored and entered as a plain number of days. */
  DAYS: 'days',
  DAY: 'day',
  SEPARATIONS_FETCH_FAILED: 'Failed to load separations',
  SEPARATION_DETAILS_FETCH_FAILED: 'This separation could not be loaded',

  /** Singular, for the employee profile's own section — the nav's plural entry is a listing. */
  SEPARATION: 'Separation',
  EMPLOYEE_SEPARATION_FETCH_FAILED: "Failed to load this employee's separation",

  /** Not an error: most employees have never had one filed. */
  NO_SEPARATION_FILED: 'No separation has been filed for this employee',

  /* The decision an approver takes on a pending separation, from the details drawer. */
  APPROVE: 'Approve',
  REJECT: 'Reject',
  APPROVE_SEPARATION: 'Approve Separation',
  REJECT_SEPARATION: 'Reject Separation',
  APPROVE_SEPARATION_CONFIRMATION:
    "The exit will be approved and the employee's last working date confirmed. This cannot be undone.",
  REJECT_SEPARATION_CONFIRMATION: 'The request will be refused and the employee will stay on. This cannot be undone.',
  SEPARATION_APPROVED: 'Separation approved',
  SEPARATION_REJECTED: 'Separation rejected',
  SEPARATION_DECISION_FAILED: 'The decision could not be recorded',

  /*
  The grounds for the decision — `remarks` on both endpoints, optional when approving and
  required when refusing, which is why only the rejection modal asks for them.
  */
  REJECTION_REMARKS: 'Reason for Rejection',
  REJECTION_REMARKS_PLACEHOLDER: 'Why is this request being refused?',
  REJECTION_REMARKS_REQUIRED: 'Give a reason for refusing this request',

  /**
   * Stand-in wording for a row just decided from this screen, used only when the decide
   * response does not carry a `statusLabel` of its own. Every read of a separation supplies
   * its own label, so these are overwritten by the next one.
   */
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
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

/**
 * A notice period is entered in days, and these are the bounds the field accepts: zero for
 * an immediate exit, and a year as the ceiling that catches a mistyped date-like number.
 */
export const NOTICE_PERIOD_DAYS = {
  MIN: 0,
  MAX: 365,
} as const;

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
    id: 'profile',
    label: STRINGS.PROFILE,
    icon: UserRound,
  },
  {
    id: 'attendance',
    label: STRINGS.ATTENDANCE,
    icon: CalendarCheck,
  },

  /*
  Always listed, like Attendance, rather than shown only for employees who have one: whether
  a separation exists is only known once it has been read, and reading it for every profile
  visit would pay for the section on the majority of screens that never open it. The section
  answers "none filed" itself.
  */
  {
    id: 'separation',
    label: STRINGS.SEPARATION,
    icon: UserRoundMinus,
  },
] as const;

/** Which section of the details screen the sidebar has open. */
export type ProfileSectionId = (typeof PROFILE_ITEMS)[number]['id'];

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

  /** The separations list. Filing one is still done from the employee list's row action. */
  SEPARATIONS: '/separations',

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
