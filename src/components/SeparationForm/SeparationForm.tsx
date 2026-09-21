/**
 * The separation form itself: who is being separated, the type and dates, and why they are
 * leaving.
 *
 * Deliberately free of page chrome — no header, no breadcrumbs, no card — so the same form
 * serves the full `initiate-separation` screen and the drawer the employee list opens from
 * its exit action. Whatever renders it decides what "cancel" means.
 *
 * @example
 * ```tsx
 * import SeparationForm from '@src/components/SeparationForm'
 *
 * export default function Example() {
 *   return <SeparationForm employee={employee} onCancel={() => router.back()} />;
 * }
 * ```
 */
'use client';

import { useState } from 'react';
import clsx from 'clsx';
import AppImage from '../AppImage';
import Button from '../Button';
import DynamicForm from '../DynamicForm';
import { FieldWidth } from '../DynamicForm/DynamicForm';
import { Caption, Text1 } from '../Typography';
import { initiateSeparation } from '@/src/lib/actions/separation';
import { SeparationOptionsClient } from '@/src/lib/api/separationClient';
import { logger } from '@/src/lib/logger';
import { useNotification } from '@/src/providers/NotificationProvider';
import { NOTIFICATION_TYPES, STRINGS } from '@/src/constants/strings';
import { initiateSeparationSchema } from './SeparationForm.schema';
import styles from './SeparationForm.module.scss';

import type { DefaultValues } from 'react-hook-form';
import type { FieldConfig } from '../DynamicForm/DynamicForm';
import type { InitiateSeparationRequest, SeparationEmployee } from '@/src/lib/types/separation';
import type { InitiateSeparationFormValues } from './SeparationForm.schema';

export type { InitiateSeparationFormValues };

/**
 * The field list, built once at module scope: DynamicForm re-runs its `reset` whenever the
 * list changes identity — an inline array would do that on every render and wipe what the
 * user had typed. That also pins the `load` below to one function identity, so reopening the
 * drawer does not re-trigger the lookup.
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

    /*
      Read from the backend rather than declared here: these are the codes `POST /separations`
      accepts, so the dropdown offering them cannot disagree with what the write will take.
      The client caches the list for the life of the page, so the request is made once no
      matter how often the drawer is reopened.
    */
    asyncOptions: {
      load: () => SeparationOptionsClient.getSeparationTypes(),
    },
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
    name: 'reason',
    label: STRINGS.REASON_FOR_LEAVING,
    placeholder: STRINGS.REASON_FOR_LEAVING_PLACEHOLDER,
    type: 'textarea',
    width: FieldWidth.FULL,
    required: true,
    rows: 4,
    maxLength: 500,
  },
  {
    name: 'notes',
    label: STRINGS.ADDITIONAL_NOTES,
    placeholder: STRINGS.ADDITIONAL_NOTES_PLACEHOLDER,
    type: 'textarea',
    width: FieldWidth.FULL,
    rows: 4,
    maxLength: 1000,
  },
];

/**
 * Also module scope, and for the same reason as the fields above: DynamicForm resets the
 * form whenever this object changes identity.
 */
const EMPTY_SEPARATION: DefaultValues<InitiateSeparationFormValues> = {
  separationType: '',
  resignationDate: '',
  noticePeriodDays: '',
  lastWorkingDate: '',
  reason: '',
  notes: '',
};

/**
 * Define the props available for the SeparationForm component.
 */
interface SeparationFormProps {
  /**
   * The employee the separation is filed against.
   */
  employee: SeparationEmployee;

  /**
   * What the cancel button does. The full screen navigates back to the employee list; the
   * drawer closes itself.
   *
   * @returns void
   */
  onCancel: () => void;

  /**
   * Called once the backend has recorded the separation, so whatever opened the form can
   * close it. Left optional: the form reports the outcome itself, and a host that wants to
   * stay open is free to do nothing.
   *
   * @returns void
   */
  onSuccess?: () => void;

  /**
   * Additional custom class name applied to the form's container, for whatever constrains
   * its width — the screen caps it, the drawer lets it fill the panel.
   */
  className?: string;
}

export default function SeparationForm({ employee, onCancel, onSuccess, className }: SeparationFormProps) {
  const { showNotification } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Builds the payload and files it.
   *
   * @remarks
   * The validated values are already the request body — the schema's field names are the
   * backend's — so only the employee, the parsed notice period and the empty-notes case need
   * handling here.
   */
  const handleSubmit = async (values: InitiateSeparationFormValues) => {
    const notes = values.notes?.trim();

    const request: InitiateSeparationRequest = {
      /*
        The "EMP0007" code rather than the record id: that is what the endpoint matches on,
        and the two are not interchangeable.
      */
      employeeId: employee.employeeId,
      separationType: values.separationType,
      resignationDate: values.resignationDate,
      noticePeriodDays: Number(values.noticePeriodDays),
      lastWorkingDate: values.lastWorkingDate,
      reason: values.reason.trim(),

      // Left off entirely rather than sent as an empty string the backend would store.
      ...(notes ? { notes } : {}),
    };

    setIsSubmitting(true);

    try {
      const result = await initiateSeparation(request);

      /*
        The detail line is the backend's own message — "Separation initiated successfully.",
        and whatever it says when it refuses — so the user is told what was actually recorded
        rather than what this form assumed.
      */
      showNotification(
        result.success ? STRINGS.SEPARATION_INITIATED : STRINGS.SEPARATION_FAILED,
        result.message,
        result.success ? NOTIFICATION_TYPES.SUCCESS : NOTIFICATION_TYPES.ERROR,
        5000,
        'top-right',
        false
      );

      /*
        Only on success: a refused separation leaves the drawer open with everything the user
        typed still in it, so they can correct whatever the backend objected to.
      */
      if (result.success) {
        onSuccess?.();
      }
    } catch (error) {
      logger.error('Unexpected error initiating the separation:', error);

      showNotification(STRINGS.SEPARATION_FAILED, '', NOTIFICATION_TYPES.ERROR, 5000, 'top-right', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={clsx(styles.container, className)}>
      <EmployeeSummary employee={employee} />

      <DynamicForm
        fields={SEPARATION_FIELDS}
        schema={initiateSeparationSchema}
        defaultValues={EMPTY_SEPARATION}
        onSubmit={handleSubmit}
        footer={
          <div className={styles.actions}>
            <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
              {STRINGS.CANCEL}
            </Button>

            <Button type="submit" loading={isSubmitting}>
              {STRINGS.INITIATE_SEPARATION}
            </Button>
          </div>
        }
      />
    </div>
  );
}

/**
 * Who the separation is being filed against, so the details being entered are never
 * attached to an employee the user cannot see they picked. Read-only throughout: the
 * employee is chosen on the list behind the drawer, not here.
 */
function EmployeeSummary({ employee }: { employee: SeparationEmployee }) {
  return (
    <div className={styles.employeeCard}>
      <AppImage src={employee.avatar} alt={employee.name} width={56} height={56} className={styles.employeeAvatar} />

      <div className={styles.employeeMeta}>
        <Text1 className={styles.employeeName}>{employee.name}</Text1>

        <Caption className={styles.employeeFacts}>{employee.employeeId}</Caption>
      </div>
    </div>
  );
}
