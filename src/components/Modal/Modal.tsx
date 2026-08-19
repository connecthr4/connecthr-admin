/**
 * A reusable and accessible modal component for displaying overlay-based dialogs, forms, and interactive content.
 *
 * @example
 * ```tsx
 * import Modal from '@src/components/Modal';
 *
 * export default function Example() {
 *   const [open, setOpen] = useState(false);
 *
 *   return (
 *     <>
 *       <button onClick={() => setOpen(true)}>
 *         Open Modal
 *       </button>
 *
 *       <Modal
 *         isOpen={open}
 *         onClose={() => setOpen(false)}
 *         title="Delete User"
 *         centered
 *         closeOnOverlayClick
 *         showCloseButton
 *       >
 *         Are you sure you want to delete this user?
 *       </Modal>
 *     </>
 *   );
 * }
 * ```
 */

'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Heading4 } from '@/src/components/Typography';
import styles from './Modal.module.scss';

/**
 * Define the props available for the Modal component.
 */
interface ModalProps {
  /**
   * Controls whether the modal is visible.
   */
  isOpen: boolean;

  /**
   * Callback function triggered when the modal should close.
   *
   * @returns void
   */
  onClose: () => void;

  /**
   * Content rendered inside the modal body.
   */
  children: ReactNode;

  /**
   * Optional title displayed in the modal header.
   */
  title?: string;

  /**
   * Determines whether clicking on the overlay closes the modal.
   *
   * @default true
   */
  closeOnOverlayClick?: boolean;

  /**
   * Determines whether the close button is displayed in the modal header.
   *
   * @default false
   */
  showCloseButton?: boolean;

  /**
   * Aligns the modal vertically at the center of the screen.
   *
   * @default true
   */
  centered?: boolean;

  /**
   * Accessible name for the dialog when it renders its own heading in the body
   * instead of passing a `title`, which would draw the header bar.
   */
  ariaLabel?: string;

  /**
   * Additional custom class name applied to the modal container.
   */
  className?: string;

  /**
   * Additional custom class name applied to the modal overlay.
   */
  overlayClassName?: string;

  /**
   * Controls the z-index of the modal overlay.
   *
   * @default 1000
   */
  zIndex?: number;

  /**
   * Maximum width of the modal container.
   * Accepts any valid CSS width value (e.g. px, rem, %).
   *
   * @default '37.5rem'
   */
  maxWidth?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  closeOnOverlayClick = true,
  showCloseButton = false,
  centered = true,
  ariaLabel,
  className = '',
  overlayClassName = '',
  zIndex = 1000,
  maxWidth = '37.5rem',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  /**
   * Handle ESC key close
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  /**
   * Prevent body scroll
   */
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  /**
   * Auto focus modal
   */
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
    }
  }, [isOpen]);

  /**
   * Close on overlay click
   */
  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  /**
   * Prevent modal click bubbling
   */
  const handleModalClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`
        ${styles.overlay}
        ${centered ? styles.centered : styles.topAligned}
        ${overlayClassName}
      `}
      style={{ zIndex }}
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || ariaLabel || 'Modal'}
        tabIndex={-1}
        className={clsx(styles.modal, className)}
        style={{ maxWidth }}
        onClick={handleModalClick}
      >
        {(title || showCloseButton) && (
          <div className={styles.header}>
            {title && <Heading4>{title}</Heading4>}

            {showCloseButton && <X height={20} width={20} onClick={onClose} aria-label="Close modal" />}
          </div>
        )}

        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
