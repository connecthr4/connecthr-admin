/**
 * AppLink is a reusable wrapper around Next.js’s Link that standardizes navigation across the application.
 *
 * @example
 * ```tsx
 * import AppLink from '@src/components/AppLink'
 *
 * export default function AppLink() {
 *   return <AppLink href="/about">About</AppLink>;
 * }
 * ```
 */
'use client';

import { AnchorHTMLAttributes, ReactNode } from 'react';
import Link, { LinkProps } from 'next/link';
import styles from './AppLink.module.scss';

/**
 * Define the props available for the AppLink component.
 */
interface AppLinkProps {
  /**
   * The destination URL of the link.
   *
   * For internal links, provide a relative path (e.g., `/about`).
   * For external links, provide a full URL (e.g., `https://example.com`).
   */
  href: string;

  /**
   * The content to be rendered inside the link.
   * Typically a string or React element such as text, icons, or both.
   */
  children: ReactNode;

  /**
   * When true, replaces the current history entry instead of pushing a new one.
   * Useful when you want to avoid keeping the previous page in the browser history.
   *
   * @default false
   */
  replace?: boolean;

  /**
   * Whether the link points to an external resource.
   *
   * If true, the link will open in a new tab (`target="_blank"`)
   * with security attributes (`rel="noopener noreferrer"`).
   */
  isExternal?: boolean;

  /**
   * Custom CSS class to apply to the rendered link element.
   * Useful for applying utility classes or module styles.
   */
  className?: string;
}

export default function AppLink({
  href,
  children,
  replace = false,
  isExternal = false,
  className,
  ...rest
}: AppLinkProps) {
  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link data-testid="AppLinkTest" href={href} replace={replace} className={className} {...rest}>
      {children}
    </Link>
  );
}
