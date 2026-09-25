/**
 * The confirmation step between clicking Approve or Reject and the decision being recorded.
 *
 * One component for both outcomes rather than two modals: the two differ only in their icon,
 * their colour and their wording, all of which are a lookup away in {@link DECISION_COPY} —
 * where two components would have been the same layout maintained twice, free to drift apart.
 *
 * Opens on a non-null `decision` instead of the usual `isOpen` pair. An approve modal has
 * nothing to say without knowing which row is being approved, so the row and the outcome
 * arrive together and "closed" is simply their absence — there is no way to hold this open on
 * half of what it needs.
 *
 * Confirms against the row, not against the reader's memory of which eye icon they clicked:
 * the employee and the last working date are repeated under the warning, since the drawer
 * behind the overlay is the only other place they appear.
 *
 * @example
 * ```tsx
 * import SeparationDecisionModal from '@src/components/SeparationDecisionModal'
 *
 * export default function Example() {
 *   return (
 *     <SeparationDecisionModal
 *       decision={pendingDecision}
 *       onClose={() => setPendingDecision(null)}
 *       onConfirm={handleConfirmDecision}
 *       isSubmitting={isDeciding}
 *     />
 *   );
 * }
 * ```
 */

'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { CircleCheckBig, CircleSlash } from 'lucide-react';
import Modal from '../Modal';
import Button from '../Button';
import TextArea from '../TextArea';
import { Caption, Heading5, Text2, Text4 } from '../Typography';
import { formatLongDate } from '@/src/utils/date';
import { STRINGS } from '@/src/constants/strings';
import styles from './SeparationDecisionModal.module.scss';

import type { LucideIcon } from 'lucide-react';
import type { SeparationDecisionOutcome, SeparationListItem } from '@/src/lib/types/separation';

export type { SeparationDecisionOutcome };

/**
 * The cap `PATCH /separations/:id/reject` puts on `remarks`.
 *
 * Enforced on the field itself rather than checked on submit: a `maxLength` stops the 1001st
 * character being typed or pasted, which is a better answer than accepting the text and
 * refusing it afterwards.
 */
const REMARKS_MAX_LENGTH = 1000;

/**
 * A decision waiting to be confirmed: which row, and which way.
 *
 * Exported because it is also the caller's state — the dashboard holds one of these, or null,
 * and passes it straight through.
 */
export interface PendingSeparationDecision {
  separation: SeparationListItem;
  outcome: SeparationDecisionOutcome;
}

/**
 * Everything that differs between approving and rejecting, keyed by outcome.
 *
 * Keyed by the union, so an outcome added later is a type error here until it has been given
 * an icon, a tone and its wording — the same guarantee `SeparationStatusBadge` gets from
 * keying its colours the same way.
 */
const DECISION_COPY: Record<
  SeparationDecisionOutcome,
  {
    icon: LucideIcon;
    title: string;
    description: string;
    confirmLabel: string;
    toneClass: string;

    /**
     * Whether the grounds have to be given before the decision can be recorded. The endpoints
     * differ on exactly this: `remarks` are optional on an approval and mandatory on a
     * rejection, so only one of the two panels carries a field.
     */
    requiresRemarks: boolean;
  }
> = {
  APPROVED: {
    icon: CircleCheckBig,
    title: STRINGS.APPROVE_SEPARATION,
    description: STRINGS.APPROVE_SEPARATION_CONFIRMATION,
    confirmLabel: STRINGS.APPROVE,
    toneClass: styles.approve,
    requiresRemarks: false,
  },
  REJECTED: {
    icon: CircleSlash,
    title: STRINGS.REJECT_SEPARATION,
    description: STRINGS.REJECT_SEPARATION_CONFIRMATION,
    confirmLabel: STRINGS.REJECT,
    toneClass: styles.reject,
    requiresRemarks: true,
  },
};

/**
 * Define the props available for the SeparationDecisionModal component.
 */
interface SeparationDecisionModalProps {
  /**
   * The decision being confirmed, or `null` for a closed modal. Carries both the row and the
   * outcome, because neither is any use to this panel without the other.
   */
  decision: PendingSeparationDecision | null;

  /**
   * Dismisses without deciding — cancel, the overlay, and `Escape`.
   *
   * @returns void
   */
  onClose: () => void;

  /**
   * Records the decision. The modal does not close itself on confirm: whether the write
   * succeeded is the caller's to know, and a modal that closed on click would take the
   * failure message's context away with it.
   *
   * @param remarks - The grounds, trimmed. Empty string when the panel did not ask for any,
   * which is only ever the approval one.
   * @returns void
   */
  onConfirm: (remarks: string) => void;

  /**
   * Locks both actions and every dismiss path while the decision is being recorded. A
   * decision cannot be taken back, so a second click or a stray `Escape` must not land
   * mid-flight.
   *
   * @default false
   */
  isSubmitting?: boolean;
}

export default function SeparationDecisionModal({
  decision,
  onClose,
  onConfirm,
  isSubmitting = false,
}: SeparationDecisionModalProps) {
  const [remarks, setRemarks] = useState('');

  /**
   * Whether the empty field has already been objected to.
   *
   * The error only appears once the approver has tried to confirm — a required field that
   * reads as wrong before it has been touched is telling them off for having just opened the
   * panel.
   */
  const [hasAttempted, setHasAttempted] = useState(false);

  /**
   * Which decision the text in the box belongs to.
   *
   * The component stays mounted when `decision` goes null — hooks cannot be skipped — so
   * without this, reopening the panel would show the last rejection's reason. Adjusted during
   * render rather than in an effect, as React recommends for state derived from something
   * else, and as `SeparationsDashboard` does with its detail read: the re-render happens
   * before the browser paints, so the stale text is never visible.
   */
  const decisionKey = decision ? `${decision.separation.id}:${decision.outcome}` : null;
  const [remarksKey, setRemarksKey] = useState(decisionKey);

  if (remarksKey !== decisionKey) {
    setRemarksKey(decisionKey);
    setRemarks('');
    setHasAttempted(false);
  }

  /*
  Rendered from nothing rather than from a stale copy of the last decision: `Modal` unmounts
  its children when closed, so there is no animation out that would need the old row kept
  around to draw.
  */
  if (!decision) {
    return null;
  }

  const { separation, outcome } = decision;
  const { icon: Icon, title, description, confirmLabel, toneClass, requiresRemarks } = DECISION_COPY[outcome];
  const { employee } = separation;

  const trimmedRemarks = remarks.trim();
  const isMissingRemarks = requiresRemarks && !trimmedRemarks;

  /**
   * Objects to an empty required field rather than passing it on.
   *
   * The button is left enabled to get here: a confirm button that greys out until the field
   * is filled gives a reader who has not spotted the field nothing to click and no reason
   * why, where this answers them.
   */
  const handleConfirm = () => {
    setHasAttempted(true);

    if (isMissingRemarks) {
      return;
    }

    onConfirm(trimmedRemarks);
  };

  return (
    <Modal
      isOpen
      onClose={isSubmitting ? () => {} : onClose}
      ariaLabel={title}
      closeOnOverlayClick={!isSubmitting}
      centered
      maxWidth="30rem"
      className={styles.modal}
    >
      <div className={styles.content}>
        <span className={clsx(styles.iconBadge, toneClass)}>
          <Icon className={styles.icon} size={32} strokeWidth={2.25} aria-hidden />
        </span>

        <Heading5 as="h2" align="center" className={styles.title}>
          {title}
        </Heading5>

        <Text4 as="p" align="center" className={styles.description}>
          {description}
        </Text4>
      </div>

      {/*
      The row, restated. The drawer holding these same facts is behind the overlay, so without
      this the reader is confirming against what they remember of it.
      */}
      <div className={styles.target}>
        <Text2 className={styles.targetName}>{employee.name}</Text2>

        {/* The designation is nullable on a list row, so the line closes up rather than
        trailing a separator. */}
        <Caption className={styles.targetMeta}>
          {[employee.employeeId, employee.department].filter(Boolean).join(' · ')}
        </Caption>

        <Caption className={styles.targetMeta}>
          {STRINGS.LAST_WORKING_DATE}: {formatLongDate(separation.lastWorkingDate)}
        </Caption>
      </div>

      {/*
      Only on the rejection panel, and required there: the endpoint refuses a rejection
      without remarks, and a refused request should always say on what grounds. An approval
      takes them too, but optionally — so it asks for nothing and keeps the common path to a
      single click.
      */}
      {requiresRemarks && (
        <TextArea
          className={styles.remarks}
          label={STRINGS.REJECTION_REMARKS}
          placeholder={STRINGS.REJECTION_REMARKS_PLACEHOLDER}
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
          error={hasAttempted && isMissingRemarks ? STRINGS.REJECTION_REMARKS_REQUIRED : undefined}
          maxLength={REMARKS_MAX_LENGTH}
          disabled={isSubmitting}
          required
          rows={3}
        />
      )}

      <div className={styles.buttonContainer}>
        <Button variant="secondary" className={styles.action} onClick={onClose} disabled={isSubmitting}>
          {STRINGS.CANCEL}
        </Button>

        {/*
        Still the primary button — this is the action the modal exists to offer — just
        recoloured to the outcome it commits to.
        */}
        <Button
          className={clsx(styles.action, styles.confirm, toneClass)}
          onClick={handleConfirm}
          loading={isSubmitting}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
