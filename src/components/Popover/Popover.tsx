/**
 * A lightweight popover atom built entirely on the native HTML Popover API
 * (`popover`, `popovertarget`, `popovertargetaction`) — no portal, no click-outside
 * listener, no focus-trap or escape-key handling written by hand. The browser owns
 * open/close state, light-dismiss, Escape-to-close and top-layer stacking; this
 * component only computes where the panel should sit relative to its trigger and
 * flips/clamps it to stay inside the viewport.
 *
 * @example
 * ```tsx
 * import Popover from '@src/components/Popover';
 * import Button from '@src/components/Button';
 *
 * export default function Example() {
 *   return (
 *     <Popover trigger={<Button>Open</Button>} placement="bottom" align="start">
 *       <p>Popover content</p>
 *     </Popover>
 *   );
 * }
 * ```
 */

'use client';

import {
  cloneElement,
  useEffect,
  useId,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import styles from './Popover.module.scss';

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';
export type PopoverAlign = 'start' | 'center' | 'end';

/**
 * Define the props available for the Popover component.
 */
interface PopoverProps {
  /**
   * The element that opens the popover when clicked. Must be a `<button>` (or a
   * component, like `Button`, that spreads unknown props onto one) — the native
   * `popovertarget`/`popovertargetaction` attributes are cloned onto it.
   */
  trigger: ReactElement<ComponentPropsWithoutRef<'button'>>;

  /**
   * Content rendered inside the popover panel.
   */
  children: ReactNode;

  /**
   * Side of the trigger the panel opens on. Flips to the opposite side automatically
   * when there isn't enough viewport space.
   *
   * @default 'bottom'
   */
  placement?: PopoverPlacement;

  /**
   * Alignment of the panel along the trigger's edge.
   *
   * @default 'center'
   */
  align?: PopoverAlign;

  /**
   * Gap, in pixels, between the trigger and the panel.
   *
   * @default 8
   */
  offset?: number;

  /**
   * Overrides the generated id linking the trigger to the panel.
   */
  id?: string;

  /**
   * Additional class name applied to the popover panel.
   */
  className?: string;

  /**
   * Called whenever the popover opens or closes.
   */
  onOpenChange?: (open: boolean) => void;
}

function getAlignedOffset(anchorStart: number, anchorSize: number, panelSize: number, align: PopoverAlign) {
  if (align === 'start') return anchorStart;
  if (align === 'end') return anchorStart + anchorSize - panelSize;
  return anchorStart + anchorSize / 2 - panelSize / 2;
}

function resolvePlacement(
  anchorRect: DOMRect,
  panelRect: DOMRect,
  placement: PopoverPlacement,
  offset: number
): PopoverPlacement {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (placement === 'bottom' && anchorRect.bottom + offset + panelRect.height > viewportHeight) {
    return anchorRect.top - offset - panelRect.height > 0 ? 'top' : 'bottom';
  }

  if (placement === 'top' && anchorRect.top - offset - panelRect.height < 0) {
    return anchorRect.bottom + offset + panelRect.height < viewportHeight ? 'bottom' : 'top';
  }

  if (placement === 'right' && anchorRect.right + offset + panelRect.width > viewportWidth) {
    return anchorRect.left - offset - panelRect.width > 0 ? 'left' : 'right';
  }

  if (placement === 'left' && anchorRect.left - offset - panelRect.width < 0) {
    return anchorRect.right + offset + panelRect.width < viewportWidth ? 'right' : 'left';
  }

  return placement;
}

function computePosition(
  anchorRect: DOMRect,
  panelRect: DOMRect,
  placement: PopoverPlacement,
  align: PopoverAlign,
  offset: number
) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const padding = 8;

  const resolvedPlacement = resolvePlacement(anchorRect, panelRect, placement, offset);

  let top: number;
  let left: number;

  switch (resolvedPlacement) {
    case 'top':
      top = anchorRect.top - panelRect.height - offset;
      left = getAlignedOffset(anchorRect.left, anchorRect.width, panelRect.width, align);
      break;
    case 'left':
      top = getAlignedOffset(anchorRect.top, anchorRect.height, panelRect.height, align);
      left = anchorRect.left - panelRect.width - offset;
      break;
    case 'right':
      top = getAlignedOffset(anchorRect.top, anchorRect.height, panelRect.height, align);
      left = anchorRect.right + offset;
      break;
    case 'bottom':
    default:
      top = anchorRect.bottom + offset;
      left = getAlignedOffset(anchorRect.left, anchorRect.width, panelRect.width, align);
      break;
  }

  return {
    top: Math.min(Math.max(top, padding), viewportHeight - panelRect.height - padding),
    left: Math.min(Math.max(left, padding), viewportWidth - panelRect.width - padding),
  };
}

export default function Popover({
  trigger,
  children,
  placement = 'bottom',
  align = 'center',
  offset = 8,
  id,
  className,
  onOpenChange,
}: PopoverProps) {
  const generatedId = useId();
  const popoverId = id ?? `popover-${generatedId}`;

  const anchorRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const anchorEl = anchorRef.current;
    const panelEl = panelRef.current;

    if (!anchorEl || !panelEl) return;

    const updatePosition = () => {
      const anchorRect = anchorEl.getBoundingClientRect();
      const panelRect = panelEl.getBoundingClientRect();
      const { top, left } = computePosition(anchorRect, panelRect, placement, align, offset);

      panelEl.style.top = `${top}px`;
      panelEl.style.left = `${left}px`;
    };

    const handleToggle = (event: Event) => {
      const isOpen = (event as ToggleEvent).newState === 'open';

      if (isOpen) {
        updatePosition();
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
      } else {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      }

      onOpenChange?.(isOpen);
    };

    panelEl.addEventListener('toggle', handleToggle);

    return () => {
      panelEl.removeEventListener('toggle', handleToggle);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [placement, align, offset, onOpenChange]);

  const clonedTrigger = cloneElement(trigger, {
    popoverTarget: popoverId,
    popoverTargetAction: 'toggle',
  });

  return (
    <>
      <span ref={anchorRef} className={styles.anchor}>
        {clonedTrigger}
      </span>

      <div ref={panelRef} id={popoverId} popover="auto" className={clsx(styles.panel, className)}>
        {children}
      </div>
    </>
  );
}
