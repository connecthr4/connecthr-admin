/**
 * A reusable typography component to maintain consistent heading and text styles across the application.
 *
 * @example
 * ```tsx
 * import Typography from '@src/components/Typography'
 *
 * export default function Typography() {
 *    return <Typography tag="span">Hello</Typography>;
 * }
 * ```
 */

import React, { ReactNode, ElementType } from 'react';
import clsx from 'clsx';
import styles from './Typography.module.scss';

/**
 * Define the props available for the Typography component.
 */
export type TypographyVariant =
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'Heading4'
  | 'text1'
  | 'text2'
  | 'text3'
  | 'text4'
  | 'label'
  | 'caption'
  | 'navLabel';

export type TextAlign = 'left' | 'center' | 'right' | 'justify' | 'start' | 'end' | 'match-parent';

export type TextTransform = 'uppercase' | 'lowercase' | 'capitalize' | 'none';

export type Truncation = 'ellipsis' | 'noWrap' | `lineClamp-${number}`;

export type TypographyProps = {
  /**
   * Render a different semantic element.
   * @example 'h1'
   */
  as?: ElementType;

  /**
   * Typography visual variant.
   */
  variant: TypographyVariant;

  /**
   * Content inside typography.
   */
  children?: ReactNode;

  /**
   * Additional custom class names.
   */
  className?: string;

  /**
   * Text alignment.
   * @default 'left'
   */
  align?: TextAlign;

  /**
   * Text transform.
   * @default 'none'
   */
  transform?: TextTransform;

  /**
   * Text truncation behavior.
   */
  truncation?: Truncation;

  /**
   * Custom text color.
   */
  color?: string;
} & React.HTMLAttributes<HTMLElement>;

function Typography({
  as: Component = 'p',
  variant,
  children,
  className,
  align = 'left',
  transform = 'none',
  truncation,
  color,
  ...rest
}: TypographyProps) {
  return (
    <Component
      data-testid="TypographyTest"
      className={clsx(
        styles.typography,
        styles[variant],
        styles[`align-${align}`],
        transform !== 'none' && styles[`transform-${transform}`],
        truncation && styles[truncation],
        className
      )}
      style={{ color }}
      {...rest}
    >
      {children}
    </Component>
  );
}

type Props = Omit<TypographyProps, 'variant'>;

export const Heading1 = (props: Props) => <Typography as="h1" variant="heading1" {...props} />;

export const Heading2 = (props: Props) => <Typography as="h2" variant="heading2" {...props} />;

export const Heading3 = (props: Props) => <Typography as="h3" variant="heading3" {...props} />;

export const Heading4 = (props: Props) => <Typography as="span" variant="heading3" {...props} />;

export const Text1 = (props: Props) => <Typography as="p" variant="text1" {...props} />;

export const Text2 = (props: Props) => <Typography as="p" variant="text2" {...props} />;

export const Text3 = (props: Props) => <Typography as="span" variant="text3" {...props} />;

export const Text4 = (props: Props) => <Typography variant="text3" {...props} />;

export const Label = (props: Props) => <Typography as="label" variant="label" {...props} />;

export const Caption = (props: Props) => <Typography as="span" variant="caption" {...props} />;

export const NavLabel = (props: Props) => <Typography as="span" variant="navLabel" {...props} />;
