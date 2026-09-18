/**
 * The screen an admin fills in to start an employee's exit: the separation's type and dates,
 * why they are leaving, and their resignation letter.
 *
 * @example
 * ```tsx
 * import InitiateSeparationForm from '@src/components/InitiateSeparationForm'
 *
 * export default function Example() {
 *   return <InitiateSeparationForm employee={employee} currentUser={user} />;
 * }
 * ```
 */
'use client';

import { useRouter } from 'next/navigation';
import AppHeader from '../AppHeader';
import AppImage from '../AppImage';
import Button from '../Button';
import DynamicForm from '../DynamicForm';
import { FieldWidth } from '../DynamicForm/DynamicForm';
import { Caption, Text1, Text2 } from '../Typography';
import { logger } from '@/src/lib/logger';
import { formatLongDateValue, parseLocalDate } from '@/src/utils/date';
import { useNotification } from '@/src/providers/NotificationProvider';
import { DOCUMENT_UPLOAD, NOTIFICATION_TYPES, ROUTES, SEPARATION_TYPES, STRINGS } from '@/src/constants/strings';
import { initiateSeparationSchema } from './InitiateSeparationForm.schema';
import styles from './InitiateSeparationForm.module.scss';

import type { DefaultValues } from 'react-hook-form';
import type { FieldConfig } from '../DynamicForm/DynamicForm';
import type { User } from '@/src/lib/types/auth';
import type { InitiateSeparationRequest, SeparationEmployee, SeparationType } from '@/src/lib/types/separation';
import type { InitiateSeparationFormValues } from './InitiateSeparationForm.schema';

/**
 * The field list, built once at module scope: none of the options are fetched, and
 * DynamicForm re-runs its `reset` whenever the list changes identity — an inline array would
 * do that on every render and wipe what the user had typed.
 */
const SEPARATION_FIELDS: FieldConfig<InitiateSeparationFormValues>[] = [
  {
    name: 'separationDetailsLabel',
    label: STRINGS.SEPARATION_DETAILS,
    type: 'label',
    labelComponent: Text1,
  },
  {
    name: 'separationType',
    label: STRINGS.SEPARATION_TYPE,
    placeholder: STRINGS.SELECT_SEPARATION_TYPE,
    type: 'dropdown',
    width: FieldWidth.HALF,
    required: true,
    // Spread, since the constant is `as const` and the dropdown takes a mutable list.
    options: [...SEPARATION_TYPES],
  },
  {
    name: 'resignationDate',
    label: STRINGS.RESIGNATION_DATE,
    type: 'datePicker',
    width: FieldWidth.HALF,
    required: true,
  },
  {
    name: 'noticePeriodDays',
    label: STRINGS.NOTICE_PERIOD_DAYS_LABEL,
    placeholder: STRINGS.NOTICE_PERIOD_PLACEHOLDER,
    type: 'input',
    width: FieldWidth.HALF,
    required: true,

    // Three digits is the widest the schema's 365-day ceiling can be written in.
    maxLength: 3,
  },
  {
    name: 'lastWorkingDate',
    label: STRINGS.LAST_WORKING_DATE,
    type: 'datePicker',
    width: FieldWidth.HALF,
    required: true,
  },
  {
    name: 'reasonForLeaving',
    label: STRINGS.REASON_FOR_LEAVING,
    placeholder: STRINGS.REASON_FOR_LEAVING_PLACEHOLDER,
    type: 'textarea',
    width: FieldWidth.FULL,
    required: true,
    rows: 4,
    maxLength: 500,
  },
  {
    name: 'additionalNotes',
    label: STRINGS.ADDITIONAL_NOTES,
    placeholder: STRINGS.ADDITIONAL_NOTES_PLACEHOLDER,
    type: 'textarea',
    width: FieldWidth.FULL,
    rows: 4,
    maxLength: 1000,
  },
  {
    name: 'resignationLetter',
    label: STRINGS.UPLOAD_RESIGNATION_LETTER,
    type: 'file',
    width: FieldWidth.FULL,
    required: true,
    accept: DOCUMENT_UPLOAD.ACCEPTED_TYPES,
    maxSizeMB: DOCUMENT_UPLOAD.MAX_SIZE_MB,
    hint: STRINGS.SUPPORTED_FORMATS,
  },
];

/**
 * Also module scope, and for the same reason as the fields above: DynamicForm resets the
 * form whenever this object changes identity. `resignationLetter` is left out — there is no
 * empty `File`, and the dropzone reads a missing value as "nothing attached".
 */
const EMPTY_SEPARATION: DefaultValues<InitiateSeparationFormValues> = {
  separationType: '',
  resignationDate: '',
  noticePeriodDays: '',
  lastWorkingDate: '',
  reasonForLeaving: '',
  additionalNotes: '',
};

/**
 * Define the props available for the InitiateSeparationForm component.
 */
interface InitiateSeparationFormProps {
  /**
   * The employee being separated, resolved on the server from the `employeeId` in the URL.
   * `null` when the screen was opened from the sidebar rather than from a row action, which
   * is the one case the form is not shown at all — a separation belongs to an employee.
   */
  employee: SeparationEmployee | null;

  /**
   * The signed-in user, for the header chip. Passed from the server render so a page reload
   * doesn't blank it out.
   */
  currentUser: User | null;
}

export default function InitiateSeparationForm({ employee, currentUser }: InitiateSeparationFormProps) {
  const router = useRouter();
  const { showNotification } = useNotification();

  /**
   * Builds the payload and hands it on.
   *
   * @remarks
   * The separation endpoint does not exist yet, so the request is assembled, typed and
   * logged rather than sent, and the user is told plainly that nothing was saved instead of
   * being shown a success they did not get. Wiring the API up is replacing the log with the
   * call — the payload is already the shape `InitiateSeparationRequest` describes.
   */
  const handleSubmit = (values: InitiateSeparationFormValues) => {
    // Unreachable: the form is only rendered once an employee has been resolved.
    if (!employee) {
      return;
    }

    const notes = values.additionalNotes?.trim();

    const request: InitiateSeparationRequest = {
      employeeId: employee.id,
      separationType: values.separationType as SeparationType,
      resignationDate: values.resignationDate,
      noticePeriodDays: Number(values.noticePeriodDays),
      lastWorkingDate: values.lastWorkingDate,
      reasonForLeaving: values.reasonForLeaving.trim(),

      // Left off entirely rather than sent as an empty string the backend would store.
      ...(notes ? { additionalNotes: notes } : {}),
      resignationLetter: values.resignationLetter,
    };

    logger.info('Separation request ready, but no endpoint to send it to yet:', {
      ...request,
      resignationLetter: { name: request.resignationLetter.name, size: request.resignationLetter.size },
    });

    showNotification(
      STRINGS.SEPARATION_SAVE_UNAVAILABLE,
      STRINGS.SEPARATION_SAVE_UNAVAILABLE_MESSAGE,
      NOTIFICATION_TYPES.WARNING,
      5000,
      'top-right',
      false
    );
  };

  /**
   * Only an employee's separation has a trail to show: reached from the sidebar there is no
   * row the screen came from, so the header falls back to its subtitle instead.
   */
  const breadcrumbs = employee
    ? [
        { label: STRINGS.ALL_EMPLOYEES, href: ROUTES.EMPLOYEES },
        { label: employee.name, href: `${ROUTES.EMPLOYEES}/${employee.id}` },
        { label: STRINGS.INITIATE_SEPARATION },
      ]
    : undefined;

  return (
    <div className={styles.container}>
      <AppHeader
        title={STRINGS.INITIATE_SEPARATION}
        subtitle={breadcrumbs ? undefined : STRINGS.START_THE_EXIT_PROCESS}
        userDetails={currentUser}
        breadcrumbs={breadcrumbs}
      />

      <div className={styles.content}>
        {employee ? (
          <>
            <EmployeeSummary employee={employee} />

            <DynamicForm
              fields={SEPARATION_FIELDS}
              schema={initiateSeparationSchema}
              defaultValues={EMPTY_SEPARATION}
              onSubmit={handleSubmit}
              className={styles.form}
              footer={
                <div className={styles.actions}>
                  <Button variant="secondary" onClick={() => router.push(ROUTES.EMPLOYEES)}>
                    {STRINGS.CANCEL}
                  </Button>

                  <Button type="submit">{STRINGS.INITIATE_SEPARATION}</Button>
                </div>
              }
            />
          </>
        ) : (
          <div className={styles.emptyState}>
            <Text1>{STRINGS.NO_EMPLOYEE_CHOSEN}</Text1>

            <Text2 className={styles.emptyStateHint}>{STRINGS.CHOOSE_EMPLOYEE_TO_SEPARATE}</Text2>

            <Button onClick={() => router.push(ROUTES.EMPLOYEES)}>{STRINGS.ALL_EMPLOYEES}</Button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Who the separation is being filed against, so the details being entered are never
 * attached to an employee the user cannot see they picked. Read-only throughout: the
 * employee is chosen on the list screen, not here.
 */
function EmployeeSummary({ employee }: { employee: SeparationEmployee }) {
  const joinedOn = formatLongDateValue(parseLocalDate(employee.dateOfJoining));

  return (
    <div className={styles.employeeCard}>
      <AppImage src={employee.avatar} alt={employee.name} width={56} height={56} className={styles.employeeAvatar} />

      <div className={styles.employeeMeta}>
        <Text1 className={styles.employeeName}>{employee.name}</Text1>

        <Caption className={styles.employeeFacts}>
          {employee.employeeId} · {employee.designation || STRINGS.NOT_AVAILABLE} ·{' '}
          {employee.department || STRINGS.NOT_AVAILABLE}
        </Caption>

        <Caption className={styles.employeeFacts}>
          {STRINGS.DATE_OF_JOINING}: {joinedOn || STRINGS.NOT_AVAILABLE}
        </Caption>
      </div>
    </div>
  );
}
