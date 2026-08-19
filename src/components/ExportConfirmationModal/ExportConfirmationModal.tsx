/**
 * A shared confirmation modal asking the user to confirm a file download.
 *
 * Module-agnostic: only the `description` is required from the caller, while
 * the title and confirm label default to the wording every export uses, so
 * the modals stay consistent across modules unless a module needs otherwise.
 *
 * @example
 * ```tsx
 * import ExportConfirmationModal from '@src/components/ExportConfirmationModal'
 *
 * export default function Example() {
 *   return (
 *     <ExportConfirmationModal
 *       isOpen={isOpen}
 *       onClose={() => setIsOpen(false)}
 *       onConfirm={handleExport}
 *       description={STRINGS.EXPORT_HOLIDAYS_CONFIRMATION}
 *       isExporting={isExporting}
 *     />
 *   );
 * }
 * ```
 */

import type { ReactNode } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import { Download } from 'lucide-react';
import { Heading5, Text4 } from '../Typography';
import { STRINGS } from '@/src/constants/strings';
import styles from './ExportConfirmationModal.module.scss';

/**
 * Define the props available for the ExportConfirmationModal component.
 */
interface ExportConfirmationModalProps {
  isOpen: boolean;

  onClose: () => void;

  onConfirm: () => void;

  /**
   * What the caller's module is about to download. The one piece of copy that
   * cannot be shared, so it is required.
   */
  description: string;

  /**
   * Heading shown in the modal header.
   *
   * @default STRINGS.DOWNLOAD
   */
  title?: string;

  /**
   * Label on the confirming button.
   *
   * @default STRINGS.DOWNLOAD
   */
  confirmLabel?: string;

  /**
   * Locks both actions and the dismiss paths while the download runs.
   *
   * @default false
   */
  isExporting?: boolean;

  /**
   * Extra content rendered under the description — e.g. the scope radios a
   * filterable table offers. Omitted entirely by modules with nothing to ask.
   */
  children?: ReactNode;
}

export default function ExportConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  description,
  title = STRINGS.DOWNLOAD,
  confirmLabel = STRINGS.DOWNLOAD,
  isExporting = false,
  children,
}: ExportConfirmationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={isExporting ? () => {} : onClose}
      ariaLabel={title}
      closeOnOverlayClick={!isExporting}
      centered
      maxWidth="30rem"
      className={styles.modal}
    >
      <div className={styles.content}>
        <span className={styles.iconBadge}>
          <Download className={styles.icon} size={32} strokeWidth={2.25} aria-hidden />
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
        <Button variant="secondary" className={styles.action} onClick={onClose} disabled={isExporting}>
          {STRINGS.CANCEL}
        </Button>

        <Button variant="primary" className={styles.action} onClick={onConfirm} loading={isExporting}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
