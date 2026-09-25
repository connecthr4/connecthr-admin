/**
 * The separation form as it was submitted, read-only.
 *
 * The counterpart to `SeparationForm`: that one files a separation, this one shows what was
 * filed. Kept apart rather than made a `readOnly` mode of the form, because a disabled form
 * is a worse way to read a record than plain text is — no inputs to tab through, no
 * placeholders, and a long reason can wrap instead of scrolling inside a textarea.
 *
 * Renders in two halves, which is what keeps the drawer from opening on a spinner: everything
 * the list row already carries — who, which type, the dates, the status — is drawn
 * immediately from `summary`, and only the fields that need the detail read (the reason, the
 * notes, who raised it) wait on `detail`. The panel therefore opens full and fills in, rather
 * than opening empty.
 *
 * `summary` is optional, for the second place this renders: the Separation section of an
 * employee's profile, which reaches the record by employee rather than from a table row and
 * so has no row to open with. There every field waits on the one read, and the employee card
 * is dropped — the profile already names the employee directly above the panel, so repeating
 * their photo, id and department here would only say it twice. The status badge stays, on a
 * header of its own.
 *
 * Shows what was *filed*, and nothing about what became of it: the employee's employment
 * status and the decision are deliberately left out, so the panel answers one question rather
 * than two. The status badge at the top is the whole of where the separation stands.
 *
 * Like the form it carries no page chrome, so the drawer that opens it decides the width.
 *
 * @example
 * ```tsx
 * import SeparationDetails from '@src/components/SeparationDetails'
 *
 * export default function Example() {
 *   return <SeparationDetails summary={row} detail={detail} isLoading={false} />;
 * }
 * ```
 */

'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { CircleUserRound, RotateCw } from 'lucide-react';
import AppImage from '../AppImage';
import Button from '../Button';
import SeparationStatusBadge from '../SeparationStatusBadge';
import { Caption, Text1, Text2 } from '../Typography';
import { formatLongDate, formatTimestampDate } from '@/src/utils/date';
import { STRINGS } from '@/src/constants/strings';
import styles from './SeparationDetails.module.scss';

import type { ReactNode } from 'react';
import type { SeparationDetail, SeparationListItem } from '@/src/lib/types/separation';

/**
 * Define the props available for the SeparationDetails component.
 */
interface SeparationDetailsProps {
  /**
   * The row the drawer was opened from, when there was one. Present from the separations
   * table, which is what lets the panel render in full before the detail read has come back;
   * omitted on the employee profile, where the same fields arrive with `detail`.
   */
  summary?: SeparationListItem;

  /**
   * The rest of the submission, once `GET /separations/:id` has answered. Null while it is
   * still in flight, or if it failed.
   */
  detail: SeparationDetail | null;

  /**
   * Whether the detail read is in flight. Drives the placeholders under the fields that
   * depend on it — never a spinner over the whole panel, which already has content.
   */
  isLoading?: boolean;

  /**
   * Why the detail read failed, in the backend's own words. Shown in place of those fields,
   * with `onRetry` beside it.
   */
  error?: string | null;

  /**
   * Re-runs the detail read. Omitted when there is nothing to retry.
   *
   * @returns void
   */
  onRetry?: () => void;

  /**
   * Additional custom class name applied to the container, for whatever constrains its width.
   */
  className?: string;
}

/**
 * "30 days", "1 day", "0 days" — an immediate exit is a real value the form accepts, so it
 * is spelled out rather than shown as a dash that would read as missing.
 */
function formatNoticePeriod(days?: number): string {
  if (days === undefined) {
    return '';
  }

  return `${days} ${days === 1 ? STRINGS.DAY : STRINGS.DAYS}`;
}

export default function SeparationDetails({
  summary,
  detail,
  isLoading = false,
  error = null,
  onRetry,
  className,
}: SeparationDetailsProps) {
  /*
  Where the fields the list also carries are read from. The row when there is one, so the
  drawer paints them before the read lands; the detail otherwise, which is the profile's
  only source for them.
  */
  const record = summary ?? detail;

  /* Those same fields are pending exactly when there was no row to draw them from. */
  const isRecordLoading = isLoading && !summary;

  const employee = summary?.employee;

  return (
    <div data-testid="SeparationDetailsTest" className={clsx(styles.container, className)}>
      {employee ? (
        <div className={styles.employeeCard}>
          <EmployeeAvatar src={employee.avatar} name={employee.name} />

          <div className={styles.employeeMeta}>
            <Text1 className={styles.employeeName}>{employee.name}</Text1>

            {/* The designation is nullable, so the line collapses to the id and department
            rather than showing a dangling separator. */}
            <Caption className={styles.employeeFacts}>
              {[employee.employeeId, employee.department].filter(Boolean).join(' · ')}
            </Caption>
          </div>

          {/* On the card rather than in the drawer's title bar, so it reads as this
          separation's status and not the panel's. */}
          <SeparationStatusBadge status={summary.status} label={summary.statusLabel} className={styles.status} />
        </div>
      ) : (
        /*
        No employee card on the profile — the screen already names them above. A heading
        instead, matching the "Personal Details" and "Bank Account Details" headings the
        profile's other sections carry, so the panel starts the same way they do. Where the
        separation stands moves into the fields below, as a value like any other.

        Static, so it needs no placeholder: the panel is headed from the first render, and
        only the values below it wait on the read.
        */
        <Text1>{STRINGS.SEPARATION_DETAILS}</Text1>
      )}

      {/*
      A description list rather than a grid of divs: every row here is a label and its value,
      which is what `dl` is for, and it is what lets a screen reader announce the two together.
      */}
      <dl className={styles.fields}>
        {/*
        Only where there is no employee card, which is the one place the badge used to sit:
        in the drawer the card still carries it, and a Status row there would say the same
        thing twice. First in the list either way — where the separation stands is the first
        thing asked of it.
        */}
        {!summary && (
          /*
          Spans the row, which is what keeps the pairs below it intact: an odd field in a
          two-column grid would push every later one across, splitting the notice period
          from the last working date it produces, and leaving the gap mid-list instead.
          */
          <Field label={STRINGS.STATUS} wide bare isLoading={isRecordLoading}>
            {record && <SeparationStatusBadge status={record.status} label={record.statusLabel} />}
          </Field>
        )}

        {/* Everything down to here comes off the row when there is one, so it is on screen
        the moment the drawer opens — and off the detail read when there is not. */}
        <Field label={STRINGS.SEPARATION_TYPE} isLoading={isRecordLoading}>
          {record?.separationTypeLabel}
        </Field>

        <Field label={STRINGS.RESIGNATION_DATE} isLoading={isRecordLoading}>
          {formatLongDate(record?.resignationDate)}
        </Field>

        <Field label={STRINGS.NOTICE_PERIOD} isLoading={isRecordLoading}>
          {formatNoticePeriod(record?.noticePeriodDays)}
        </Field>

        <Field label={STRINGS.LAST_WORKING_DATE} isLoading={isRecordLoading}>
          {formatLongDate(record?.lastWorkingDate)}
        </Field>

        <Field label={STRINGS.RAISED_ON} isLoading={isRecordLoading}>
          {formatTimestampDate(record?.raisedAt) || STRINGS.NOT_AVAILABLE}
        </Field>

        {/* Only on the detail read — the list does not say who filed it. */}
        <Field label={STRINGS.RAISED_BY} isLoading={isLoading}>
          {detail?.raisedBy?.name ?? STRINGS.NOT_AVAILABLE}
        </Field>

        {/*
        The reason and the notes are the whole point of opening the drawer, and the only
        fields the list cannot supply — so they are what the loading and error states are
        about. Both run the full width: a reason is a paragraph, not a value.
        */}
        {error ? (
          <div className={styles.error}>
            <Text2 className={styles.errorText}>{error}</Text2>

            {onRetry && (
              <Button variant="secondary" startIcon={RotateCw} onClick={onRetry}>
                {STRINGS.TRY_AGAIN}
              </Button>
            )}
          </div>
        ) : (
          <>
            <Field label={STRINGS.REASON_FOR_LEAVING} wide isLoading={isLoading} lines={2}>
              {detail?.reason}
            </Field>

            {/*
            Rendered only once the read is back and there were notes. An empty row labelled
            "Additional Notes" would say nothing the absence of the row does not already say.
            */}
            {detail?.notes && (
              <Field label={STRINGS.ADDITIONAL_NOTES_LABEL} wide>
                {detail.notes}
              </Field>
            )}
          </>
        )}
      </dl>
    </div>
  );
}

/**
 * The employee's photo, or a lucide glyph where there isn't one.
 *
 * Two cases, and both end at the same icon: `avatar` is `null` for an employee with no photo
 * on file, which is the ordinary case rather than an error, and a URL that is present but
 * fails to load. The second is why this holds state at all — `AppImage`'s `fallbackSrc`
 * takes an image URL, and the point here is not to have a second image to fall back to.
 *
 * The icon is `aria-hidden`: the employee's name sits immediately beside it, so announcing a
 * generic person glyph would only repeat what the next line already says.
 */
function EmployeeAvatar({ src, name }: { src: string | null; name: string }) {
  const [hasFailed, setHasFailed] = useState(false);

  if (!src || hasFailed) {
    return (
      <span data-testid="SeparationAvatarFallbackTest" aria-hidden className={styles.employeeAvatarFallback}>
        <CircleUserRound size={32} strokeWidth={1.5} />
      </span>
    );
  }

  return (
    <AppImage
      src={src}
      alt={name}
      width={56}
      height={56}
      className={styles.employeeAvatar}
      onError={() => setHasFailed(true)}
    />
  );
}

/**
 * One labelled value in the list.
 *
 * @param wide - Spans both columns, for the free-text fields.
 * @param isLoading - Draws a placeholder bar in place of the value.
 * @param lines - How many placeholder bars to draw, for a field that holds a paragraph.
 * @param bare - Renders the value as given, without the `Text2` wrapper. For a value that
 *   brings its own presentation — the status pill — where a paragraph around it would be
 *   the wrong shape and would impose a line height the pill then has to fight.
 */
function Field({
  label,
  children,
  wide = false,
  isLoading = false,
  lines = 1,
  bare = false,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
  isLoading?: boolean;
  lines?: number;
  bare?: boolean;
}) {
  return (
    <div className={clsx(styles.field, { [styles.fieldWide]: wide })}>
      <dt>
        <Caption className={styles.fieldLabel}>{label}</Caption>
      </dt>

      <dd className={styles.fieldValue}>
        {isLoading ? (
          <span aria-hidden className={clsx(styles.bones, { [styles.bonePill]: bare })}>
            {Array.from({ length: lines }).map((_, index) => (
              <span key={index} className={styles.bone} />
            ))}
          </span>
        ) : bare ? (
          children
        ) : (
          <Text2>{children}</Text2>
        )}
      </dd>
    </div>
  );
}
