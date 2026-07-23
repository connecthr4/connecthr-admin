import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import AppLink from './AppLink';

describe('AppLink', () => {
  it('renders an internal link using next/link with the given href', () => {
    render(<AppLink href="/about">About</AppLink>);

    const link = screen.getByTestId('AppLinkTest');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/about');
    expect(link).toHaveTextContent('About');
  });

  it('does not set target or rel attributes for internal links', () => {
    render(<AppLink href="/dashboard">Dashboard</AppLink>);

    const link = screen.getByTestId('AppLinkTest');
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  it('applies a custom className to an internal link', () => {
    render(
      <AppLink className="custom-link" href="/settings">
        Settings
      </AppLink>
    );

    expect(screen.getByTestId('AppLinkTest')).toHaveClass('custom-link');
  });

  it('forwards additional props to the internal link', () => {
    render(
      <AppLink data-tracking-id="nav-about" href="/about">
        About
      </AppLink>
    );

    expect(screen.getByTestId('AppLinkTest')).toHaveAttribute('data-tracking-id', 'nav-about');
  });

  it('renders a plain anchor with security attributes when isExternal is true', () => {
    render(
      <AppLink href="https://example.com" isExternal>
        Visit example.com
      </AppLink>
    );

    const link = screen.getByRole('link', { name: 'Visit example.com' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('applies a custom className to an external link', () => {
    render(
      <AppLink className="external-link" href="https://example.com" isExternal>
        Visit example.com
      </AppLink>
    );

    expect(screen.getByRole('link', { name: 'Visit example.com' })).toHaveClass('external-link');
  });

  it('forwards additional props to the external anchor', () => {
    render(
      <AppLink data-tracking-id="external-nav" href="https://example.com" isExternal>
        Visit example.com
      </AppLink>
    );

    expect(screen.getByRole('link', { name: 'Visit example.com' })).toHaveAttribute(
      'data-tracking-id',
      'external-nav'
    );
  });

  it('does not render an external link when isExternal is false', () => {
    render(
      <AppLink href="https://example.com" isExternal={false}>
        Visit example.com
      </AppLink>
    );

    const link = screen.getByTestId('AppLinkTest');
    expect(link).not.toHaveAttribute('target');
  });

  it('renders ReactNode children', () => {
    render(
      <AppLink href="/about">
        <span>Custom</span> <strong>content</strong>
      </AppLink>
    );

    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});
