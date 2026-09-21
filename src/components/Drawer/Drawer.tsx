/**
 * A reusable and accessible drawer (off-canvas panel) for filters, detail views and side forms.
 *
 * Built on the native `<dialog>` element, so the browser supplies the focus trap, the top-layer
 * stacking (no z-index juggling, no portal), the backdrop, `Escape` handling and focus restoration
 * to whatever opened the drawer. No third party libraries are involved in any of that behaviour.
 *
 * @example
 * ```tsx
 * import Drawer from '@/src/components/Drawer';
 *
 * export default function Example() {
 *   const [open, setOpen] = useState(false);
 *
 *   return (
 *     <>
 *       <button onClick={() => setOpen(true)}>Open Drawer</button>
 *
 *       <Drawer
 *         isOpen={open}
 *         onClose={() => setOpen(false)}
 *         title="Filter employees"
 *         placement="right"
 *         footer={<button onClick={() => setOpen(false)}>Apply</button>}
 *       >
 *         Drawer content
 *       </Drawer>
 *     </>
 *   );
 * }
 * ```
 */

'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { X } from 'lucide-react';
import styles from './Drawer.module.scss';

/**
 * Edge of the viewport the drawer slides in from.
 */
export type DrawerPlacement = 'right' | 'left' | 'top' | 'bottom';

/**
 * Define the props available for the Drawer component.
 */
interface DrawerProps {
  /**
   * Controls whether the drawer is visible.
   */
  isOpen: boolean;

  /**
   * Callback function triggered when the drawer should close.
   *
   * Fires for the close button, the overlay, the `Escape` key and for a
   * `<form method="dialog">` submitted from inside the body.
   *
   * @returns void
   */
  onClose: () => void;

  /**
   * Content rendered inside the scrollable drawer body.
   */
  children: ReactNode;

  /**
   * Optional title displayed on the left of the drawer header.
   */
  title?: string;

  /**
   * Optional content pinned to the bottom of the drawer, outside the scroll area.
   */
  footer?: ReactNode;

  /**
   * Edge the drawer is anchored to and slides in from.
   *
   * @default 'right'
   */
  placement?: DrawerPlacement;

  /**
   * Width of a left/right drawer, or height of a top/bottom one.
   * Accepts any valid CSS length (e.g. px, rem, %, vw).
   *
   * @default '26rem'
   */
  size?: string;

  /**
   * Determines whether clicking the overlay closes the drawer.
   *
   * @default true
   */
  closeOnOverlayClick?: boolean;

  /**
   * Determines whether pressing `Escape` closes the drawer.
   *
   * @default true
   */
  closeOnEsc?: boolean;

  /**
   * Determines whether the close button is displayed on the right of the header.
   *
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Accessible name for the close button.
   *
   * @default 'Close drawer'
   */
  closeButtonLabel?: string;

  /**
   * Prevents the page behind the drawer from scrolling while it is open.
   *
   * @default true
   */
  lockScroll?: boolean;

  /**
   * Unmounts the drawer content once the closing animation has finished, so forms and
   * queries inside it start fresh on the next open. Set to `false` to preserve their state.
   *
   * @default true
   */
  unmountOnClose?: boolean;

  /**
   * Length of the open/close animation in milliseconds. Drives both the CSS transition
   * and the delay before the content unmounts, so the two can never drift apart.
   *
   * @default 300
   */
  transitionDuration?: number;

  /**
   * Element focused when the drawer opens. Defaults to the first focusable element,
   * which the browser picks on its own.
   */
  initialFocusRef?: RefObject<HTMLElement | null>;

  /**
   * Accessible name for the drawer when no `title` is passed.
   *
   * @default 'Drawer'
   */
  ariaLabel?: string;

  /**
   * Additional custom class name applied to the drawer panel.
   */
  className?: string;

  /**
   * Additional custom class name applied to the scrollable body.
   */
  bodyClassName?: string;
}

export default function Drawer({
  isOpen,
  onClose,
  children,
  title,
  footer,
  placement = 'right',
  size = '26rem',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  closeButtonLabel = 'Close drawer',
  lockScroll = true,
  unmountOnClose = true,
  transitionDuration = 300,
  initialFocusRef,
  ariaLabel = 'Drawer',
  className = '',
  bodyClassName = '',
}: DrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  /**
   * Tracks whether the pointer press that leads to a click started on the overlay.
   * Without it, selecting text inside the panel and releasing outside would close the drawer,
   * because the click is reported against the closest common ancestor.
   */
  const pressedOverlay = useRef(false);

  /**
   * Keeps the content mounted for the length of the closing animation, so the panel does not
   * slide out empty.
   */
  const [isContentMounted, setIsContentMounted] = useState(isOpen);

  /**
   * Drive the native dialog from the `isOpen` prop.
   *
   * `showModal` is what puts the element in the top layer and traps focus; calling it on an
   * already open dialog throws, hence the guards.
   */
  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }

      initialFocusRef?.current?.focus();

      return;
    }

    if (dialog.open) {
      dialog.close();
    }
  }, [isOpen, initialFocusRef]);

  /**
   * Mount the content as the drawer opens.
   *
   * Adjusting the state during render rather than in an effect, as React recommends for a value
   * derived from a prop: the re-render happens before the browser paints, so the panel is never
   * shown empty for a frame.
   */
  if (isOpen && !isContentMounted) {
    setIsContentMounted(true);
  }

  /**
   * Unmount the content once the drawer has finished sliding away, so forms and queries inside
   * it start fresh on the next open.
   */
  useEffect(() => {
    if (isOpen || !unmountOnClose) return;

    const timer = window.setTimeout(() => setIsContentMounted(false), transitionDuration);

    return () => window.clearTimeout(timer);
  }, [isOpen, unmountOnClose, transitionDuration]);

  /**
   * Prevent the page behind the drawer from scrolling, padding the body by the width of the
   * scrollbar it replaces so the layout does not jump.
   */
  useEffect(() => {
    if (!isOpen || !lockScroll) return;

    const { body } = document;
    const originalOverflow = body.style.overflow;
    const originalPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = originalOverflow;
      body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen, lockScroll]);

  /**
   * Handle the `Escape` key.
   *
   * The default action is always cancelled: the parent owns `isOpen`, so the browser must never
   * close the dialog behind its back and leave the two out of sync.
   */
  const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();

    if (closeOnEsc) {
      onClose();
    }
  };

  /**
   * Catch closes the component did not initiate, such as a `<form method="dialog">` submitted
   * from the body.
   */
  const handleClose = () => {
    if (isOpen) {
      onClose();
    }
  };

  /**
   * Record where the press started, so only a press and release on the overlay closes the drawer.
   */
  const handleMouseDown = (event: React.MouseEvent<HTMLDialogElement>) => {
    pressedOverlay.current = event.target === event.currentTarget;
  };

  /**
   * Close on overlay click.
   *
   * Clicks on `::backdrop` are reported against the dialog itself, and the panel covers the
   * element's own box, so hitting the dialog directly can only mean the overlay.
   */
  const handleClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    const clickedOverlay = pressedOverlay.current && event.target === event.currentTarget;

    pressedOverlay.current = false;

    if (closeOnOverlayClick && clickedOverlay) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      data-testid="DrawerTest"
      data-placement={placement}
      className={`${styles.drawer} ${className}`.trim()}
      style={
        {
          '--drawer-size': size,
          '--drawer-duration': `${transitionDuration}ms`,
        } as CSSProperties
      }
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : ariaLabel}
      onCancel={handleCancel}
      onClose={handleClose}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {(isContentMounted || !unmountOnClose) && (
        <div className={styles.panel}>
          {(title || showCloseButton) && (
            <header className={styles.header}>
              {title && (
                <h2 id={titleId} className={styles.title}>
                  {title}
                </h2>
              )}

              {showCloseButton && (
                <button type="button" className={styles.closeButton} aria-label={closeButtonLabel} onClick={onClose}>
                  <X size={20} />
                </button>
              )}
            </header>
          )}

          <div className={`${styles.body} ${bodyClassName}`.trim()}>{children}</div>

          {footer && <footer className={styles.footer}>{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}
