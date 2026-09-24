/**
 * A shared confirmation modal for a destructive, irreversible action.
 *
 * Module-agnostic, the way `ExportConfirmationModal` is: only the
 * `description` is required, since what is about to be destroyed — and what
 * survives it — is the one thing no two callers can share.
 *
 * @example
 * ```tsx
 * import DeleteConfirmationModal from '@src/components/DeleteConfirmationModal'
 *
 * export default function Example() {
 *   return (
 *     <DeleteConfirmationModal
 *       isOpen={isOpen}
 *       onClose={() => setIsOpen(false)}
 *       onConfirm={handleDelete}
 *       title={STRINGS.DELETE_USER}
 *       description={STRINGS.DELETE_USER_CONFIRMATION}
 *       isDeleting={isDeleting}
 *     />
 *   );
 * }
 * ```
 */

import type { ReactNode } from 'react';
import clsx from 'clsx';
import Modal from '../Modal';
import Button from '../Button';
import { TriangleAlert } from 'lucide-react';
import { Heading5, Text4 } from '../Typography';
import { STRINGS } from '@/src/constants/strings';
import styles from './DeleteConfirmationModal.module.scss';

/**
 * Define the props available for the DeleteConfirmationModal component.
 */
interface DeleteConfirmationModalProps {
  isOpen: boolean;

  onClose: () => void;

  onConfirm: () => void;

  /**
   * What is about to be deleted, and what deleting it does not undo. The one
   * piece of copy that cannot be shared, so it is required.
   */
  description: string;

  /**
   * Heading shown above the description.
   *
   * @default STRINGS.DELETE
   */
  title?: string;

  /**
   * Label on the destructive button.
   *
   * @default STRINGS.DELETE
   */
  confirmLabel?: string;

  /**
   * Locks both actions and every dismiss path while the delete runs — there is
   * no undo, so a second click or a stray Escape must not land mid-flight.
   *
   * @default false
   */
  isDeleting?: boolean;

  /**
   * Rendered under the description — e.g. the name and email of the record in
   * question, so the reader confirms against the row rather than their memory
   * of which one they clicked.
   */
  children?: ReactNode;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  description,
  title = STRINGS.DELETE,
  confirmLabel = STRINGS.DELETE,
  isDeleting = false,
  children,
}: DeleteConfirmationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={isDeleting ? () => {} : onClose}
      ariaLabel={title}
      closeOnOverlayClick={!isDeleting}
      centered
      maxWidth="30rem"
      className={styles.modal}
    >
      <div className={styles.content}>
        <span className={styles.iconBadge}>
          <TriangleAlert className={styles.icon} size={32} strokeWidth={2.25} aria-hidden />
        </span>

        <Heading5 as="h2" align="center" className={styles.title}>
          {title}
        </Heading5>

        <Text4 as="p" align="center" className={styles.description}>
          {description}
        </Text4>
      </div>

      {children && <div className={styles.extras}>{children}</div>}

      <div className={styles.buttonContainer}>
        <Button variant="secondary" className={styles.action} onClick={onClose} disabled={isDeleting}>
          {STRINGS.CANCEL}
        </Button>

        <Button className={clsx(styles.action, styles.confirm)} onClick={onConfirm} loading={isDeleting}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
