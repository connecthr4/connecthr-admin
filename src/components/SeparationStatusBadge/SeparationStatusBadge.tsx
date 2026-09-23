/**
 * A separation's current state, as a coloured pill.
 *
 * Its own component rather than a cell renderer because two screens show the same state —
 * the list's status column and the detail drawer's header — and a status that reads amber in
 * one place and grey in the other would be worse than either.
 *
 * The *wording* comes from the backend, which sends a `statusLabel` beside every status
 * ("Pending Approval", not "Pending"). Only the colour is decided here, because a colour is
 * not something the API has an opinion about.
 *
 * @example
 * ```tsx
 * import SeparationStatusBadge from '@src/components/SeparationStatusBadge'
 *
 * export default function Example() {
 *   return <SeparationStatusBadge status="PENDING" label="Pending Approval" />;
 * }
 * ```
 */

import clsx from 'clsx';
import styles from './SeparationStatusBadge.module.scss';

import type { SeparationStatus } from '@/src/lib/types/separation';

/**
 * Amber for a decision still outstanding, green for one that was granted, red for one that
 * was refused, and grey for a separation taken back — the same reading the rest of the app
 * gives those colours.
 *
 * Keyed by the status union, so adding a state is a type error here until it has been given
 * a colour.
 */
const STATUS_CLASS: Record<SeparationStatus, string> = {
  PENDING: styles.pending,
  APPROVED: styles.approved,
  REJECTED: styles.rejected,
  WITHDRAWN: styles.withdrawn,
};

/**
 * Define the props available for the SeparationStatusBadge component.
 */
interface SeparationStatusBadgeProps {
  /** The backend's code, which decides the colour. */
  status: SeparationStatus;

  /**
   * The backend's own wording for that status, which is what is rendered.
   *
   * Falls back to the raw code only if a response ever omits it — an unstyled-looking
   * "PENDING" is a visible prompt to fix the response, where an empty pill would not be.
   */
  label?: string;

  /**
   * Additional custom class name applied to the pill, for whatever positions it.
   */
  className?: string;
}

export default function SeparationStatusBadge({ status, label, className }: SeparationStatusBadgeProps) {
  return (
    <span data-testid="SeparationStatusBadgeTest" className={clsx(styles.badge, STATUS_CLASS[status], className)}>
      {label || status}
    </span>
  );
}
