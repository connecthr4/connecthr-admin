/**
 * The layout every full-page status screen shares: an illustration on a tinted canvas, a
 * heading that names what happened, a line or two explaining it, and the ways out.
 *
 * It owns the chrome — canvas, ornaments, measure, spacing, the button treatment — so the
 * screens built on it (`NotFoundScreen`, `ErrorScreen`) differ only in what they say and
 * where their buttons lead, and cannot drift apart visually.
 *
 * @example
 * ```tsx
 * import StatusScreen from '@src/components/StatusScreen'
 *
 * export default function Offline() {
 *   return (
 *     <StatusScreen
 *       illustration={{ src: '/offline.svg', width: 348, height: 266 }}
 *       title="You are offline"
 *       description="Check the connection and try again."
 *       actions={[{ label: 'Retry', icon: RotateCw, onClick: retry, variant: 'primary' }]}
 *     />
 *   );
 * }
 * ```
 */

import type { LucideIcon } from 'lucide-react';
import AppImage from '../AppImage';
import Button from '../Button';
import { Heading3, Heading5, Text2, Text4 } from '../Typography/Typography';
import styles from './StatusScreen.module.scss';

/**
 * One of the ways off the screen. Rendered in the order given, so the quieter choice is
 * listed first and the one the user most likely wants last, nearest the pointer.
 */
export interface StatusScreenAction {
  label: string;

  /** Drawn at the start of the button, at the size every status screen uses. */
  icon: LucideIcon;

  onClick: () => void;

  /**
   * Only one action per screen should be `primary` — it is the recommended way out.
   *
   * @default 'secondary'
   */
  variant?: 'primary' | 'secondary';
}

/**
 * Define the props available for the StatusScreen component.
 */
interface StatusScreenProps {
  /**
   * The drawing above the heading, and its intrinsic size — the artwork is rendered at a
   * fixed height, so the width given only has to state the file's own aspect ratio.
   */
  illustration: {
    src: string;
    width: number;
    height: number;
  };

  /**
   * An HTTP status or error code, set in display type above the heading. Where one is shown
   * it becomes the screen's dominant mark, and the heading steps down a size to leave it be.
   */
  code?: string;

  /** What happened, in the user's terms. Rendered as the page's `h1`. */
  title: string;

  /**
   * The explanation below the heading. An array renders one paragraph per entry, which is
   * how a two-line message keeps its break where the design put it instead of wherever the
   * measure happens to run out.
   */
  description: string | string[];

  /** The ways out, at most two — more and none of them reads as the obvious choice. */
  actions: StatusScreenAction[];

  /** A closing aside, in small print. */
  note?: string;
}

export default function StatusScreen({ illustration, code, title, description, actions, note }: StatusScreenProps) {
  /*
  A screen shows one dominant element, never two: with a code above it the heading is the
  supporting line, and without one it has to carry the screen on its own.
  */
  const Title = code ? Heading5 : Heading3;

  const paragraphs = Array.isArray(description) ? description : [description];

  return (
    <div data-testid="StatusScreenTest" className={styles.container}>
      {/*
      Purely atmospheric — they carry no meaning the copy doesn't already state, and they are
      dropped below the tablet breakpoint where there is no room to place them.
      */}
      <div className={styles.ornaments} aria-hidden="true">
        <span className={styles.squareStart} />
        <span className={styles.dotEnd} />
        <span className={styles.dotStart} />
        <span className={styles.squareEnd} />
      </div>

      <div className={styles.content}>
        {/*
        Decorative: the heading below says the same thing in words. Above the fold and the
        first thing on the screen, so it is fetched eagerly.
        */}
        <AppImage
          src={illustration.src}
          alt=""
          width={illustration.width}
          height={illustration.height}
          className={styles.illustration}
          preload
        />

        {code && <p className={styles.code}>{code}</p>}

        <Title as="h1" className={styles.title}>
          {title}
        </Title>

        <div className={styles.description}>
          {paragraphs.map((paragraph) => (
            <Text4 key={paragraph} as="p" align="center">
              {paragraph}
            </Text4>
          ))}
        </div>

        <div className={styles.actions}>
          {actions.map(({ label, icon, onClick, variant = 'secondary' }) => (
            <Button
              key={label}
              variant={variant}
              startIcon={icon}
              iconSize={16}
              className={variant === 'secondary' ? styles.secondaryAction : styles.action}
              onClick={onClick}
            >
              {label}
            </Button>
          ))}
        </div>

        {note && (
          <Text2 as="p" align="center" className={styles.note}>
            {note}
          </Text2>
        )}
      </div>
    </div>
  );
}
