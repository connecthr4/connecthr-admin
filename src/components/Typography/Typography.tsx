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

import React, { JSX, ReactNode, ElementType } from 'react';
import clsx from 'clsx';
import styles from './Typography.module.scss';

/**
 * Define the props available for the Typography component.
 */
export type TypographyProps<T extends Tags = Tags> = {
  /**
   * The semantic HTML tag to render (e.g., heading, paragraph, span).
   * @example 'h1'
   */
  tag: T;

  /**
   * Override the underlying rendered element.
   * Useful when you want the styling of one tag but render another element.
   * @example 'div'
   */
  as?: ElementType;

  /**
   * The content to be displayed inside the Typography component.
   */
  children?: ReactNode;

  /**
   * Additional custom class names for styling.
   */
  className?: string;

  /**
   * Text alignment for the content.
   * @default 'left'
   */
  align?: TextAlign;

  /**
   * Text transformation style.
   * @default 'none'
   */
  transform?: TextTransform;

  /**
   * Controls text truncation and line clamping behavior.
   * @example 'ellipsis'
   * @example 'lineClamp-2'
   */
  truncation?: Truncation;

  /**
   * to handle the color of the text.
   */
  color?: string;
} & React.ComponentPropsWithoutRef<(typeof TagsMapping)[T]>;

type TextTransform = 'uppercase' | 'lowercase' | 'capitalize' | 'none';

type Truncation = 'ellipsis' | 'noWrap' | `lineClamp-${number}`;

export type TextAlign = 'left' | 'right' | 'center' | 'justify' | 'start' | 'end' | 'match-parent';

export type Tags = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'li' | 'span' | 'label';

const TagsMapping: Record<Tags, keyof JSX.IntrinsicElements> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  p: 'p',
  li: 'li',
  span: 'span',
  label: 'label',
};

export default function Typography({
  tag,
  as,
  children,
  className,
  align = 'left',
  transform = 'none',
  truncation,
  color,
  ...rest
}: TypographyProps) {
  const Component = as || TagsMapping[tag] || 'p';
  return (
    <Component
      data-testid="TypographyTest"
      className={clsx(
        styles.typography,
        styles[tag],
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
