/**
 * The application's success mark: the same lucide `CircleCheck` the success notifications
 * carry, set on a tinted disc so every "it worked" surface — confirmation modals, result
 * panels — is recognisable as the same thing.
 *
 * @example
 * ```tsx
 * import SuccessBadge from '@src/components/SuccessBadge'
 *
 * export default function Confirmation() {
 *   return <SuccessBadge />;
 * }
 * ```
 */

import { CircleCheck, type LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import styles from './SuccessBadge.module.scss';

/**
 * Define the props available for the SuccessBadge component.
 */
interface SuccessBadgeProps {
  /**
   * Diameter of the disc, in pixels. The mark inside scales with it.
   *
   * @default 48
   */
  size?: number;

  /**
   * The lucide mark drawn inside the disc. Swap it only where the outcome is worth
   * celebrating rather than merely confirming — `PartyPopper` on the record-created
   * confirmation, say. The disc and its tint stay the same either way.
   *
   * @default CircleCheck
   */
  icon?: LucideIcon;

  /**
   * Additional CSS class names for custom styling.
   */
  className?: string;
}

export default function SuccessBadge({ size = 48, icon: Icon = CircleCheck, className }: SuccessBadgeProps) {
  return (
    /*
    Decorative: every surface using this states the outcome in words right beside it, so the
    mark would only be read out twice. lucide marks the icon `aria-hidden` on its own.
    */
    <span className={clsx(styles.badge, className)} style={{ width: size, height: size }}>
      <Icon size={Math.round(size * 0.55)} />
    </span>
  );
}
